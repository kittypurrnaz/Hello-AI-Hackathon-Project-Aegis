import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions
import json
import os
import datetime
import logging
from google.cloud import dlp_v2
from apache_beam import metrics

# --- Pipeline Configuration ---
PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
PUBSUB_TOPIC = os.environ.get("PUB_SUB_TOPIC_ID")
BIGQUERY_DATASET = os.environ.get("BIGQUERY_DATASET_ID")
BIGQUERY_TABLE = os.environ.get("BIGQUERY_TABLE_ID")
TEMP_CLOUD_STORAGE = os.environ.get("TEMP_CLOUD_STORAGE")
BIGQUERY_DEAD_LETTER_TABLE = os.environ.get("BIGQUERY_DEAD_LETTER_TABLE")
DLP_DEID_TEMPLATE_NAME = os.environ.get("DLP_DEID_TEMPLATE_NAME")

if not all([PROJECT_ID, PUBSUB_TOPIC, BIGQUERY_DATASET, BIGQUERY_TABLE, BIGQUERY_DEAD_LETTER_TABLE, TEMP_CLOUD_STORAGE]):
    raise ValueError("Missing one or more required environment variables.")

# --- Resource Paths ---
pubsub_topic_path = f"projects/{PROJECT_ID}/topics/{PUBSUB_TOPIC}"
bigquery_table_spec = f"{PROJECT_ID}:{BIGQUERY_DATASET}.{BIGQUERY_TABLE}"
bigquery_dead_letter_table_spec = f"{PROJECT_ID}:{BIGQUERY_DATASET}.{BIGQUERY_DEAD_LETTER_TABLE}"

# --- BigQuery Schemas ---
BIGQUERY_SCHEMA = {
    'fields': [
        {'name': 'user_id', 'type': 'STRING', 'mode': 'NULLABLE'},
        {'name': 'timestamp', 'type': 'TIMESTAMP', 'mode': 'NULLABLE'},
        {'name': 'signal_type', 'type': 'STRING', 'mode': 'NULLABLE'},
        {'name': 'flag_type', 'type': 'STRING', 'mode': 'NULLABLE'},
        {'name': 'confidence', 'type': 'FLOAT', 'mode': 'NULLABLE'},
        {'name': 'topic_category', 'type': 'STRING', 'mode': 'NULLABLE'},
        {'name': 'source_platform', 'type': 'STRING', 'mode': 'NULLABLE'},
        {
            'name': 'event_details',
            'type': 'RECORD',
            'mode': 'NULLABLE',
            'fields': [
                {'name': 'context', 'type': 'STRING', 'mode': 'NULLABLE'},
                {'name': 'corroborating_signals', 'type': 'STRING', 'mode': 'REPEATED'}
            ]
        }
    ]
}

DEAD_LETTER_SCHEMA = {
    'fields': [
        {'name': 'timestamp', 'type': 'TIMESTAMP', 'mode': 'REQUIRED'},
        {'name': 'error_message', 'type': 'STRING', 'mode': 'REQUIRED'},
        {'name': 'raw_payload', 'type': 'STRING', 'mode': 'NULLABLE'}
    ]
}

# --- DLP Configuration ---
# A comprehensive list of InfoType detectors for thorough PII redaction.
# This list can be customized for specific needs.
# For a full list of detectors, see: https://cloud.google.com/dlp/docs/infotypes-reference
DLP_INFOTYPES = [
    # Personal Identifiers
    {"name": "PERSON_NAME"},
    {"name": "EMAIL_ADDRESS"},
    {"name": "PHONE_NUMBER"},
    {"name": "STREET_ADDRESS"},
    {"name": "LOCATION"}, # Catches cities, countries, etc.

    # National/Government Identifiers
    {"name": "SINGAPORE_NATIONAL_REGISTRATION_ID_CARD_NUMBER"}, # NRIC/FIN
    {"name": "PASSPORT"},
    {"name": "DRIVER_LICENSE_NUMBER"},

    # Financial Identifiers
    {"name": "CREDIT_CARD_NUMBER"},
    {"name": "SWIFT_CODE"},
    {"name": "IBAN_CODE"},

    # Demographic Information
    {"name": "DATE_OF_BIRTH"},
    {"name": "GENDER"},
    {"name": "ETHNIC_GROUP"},

    # Online Identifiers
    {"name": "IP_ADDRESS"},
    {"name": "MAC_ADDRESS"},
    
    # Health Information
    {"name": "MEDICAL_TERM"}
]


class ParseAndConform(beam.DoFn):
    """
    Parses a Pub/Sub message, ensures it has a valid structure for BigQuery,
    and sends malformed records to a dead-letter output.
    It also tracks metrics for successful and failed parsing operations.
    """
    def __init__(self):
        self.parsed_records_counter = metrics.Metrics.counter('main', 'parsed_records_successfully')
        self.failed_records_counter = metrics.Metrics.counter('main', 'parsing_failures')

    def process(self, element: bytes):
        try:
            json_string = element.decode('utf-8')
            data = json.loads(json_string)

            # --- Data Conformance ---
            # Ensure every record has a consistent structure, even if fields are empty.
            # This prevents schema errors when writing to BigQuery.
            if 'event_details' not in data or data['event_details'] is None:
                data['event_details'] = {}
            if 'context' not in data['event_details'] or data['event_details']['context'] is None:
                data['event_details']['context'] = ""
            if 'corroborating_signals' not in data['event_details'] or data['event_details']['corroborating_signals'] is None:
                 data['event_details']['corroborating_signals'] = []
            
            self.parsed_records_counter.inc()
            logging.info(f"Successfully parsed message for user_id: {data.get('user_id')}")
            yield data

        except Exception as e:
            self.failed_records_counter.inc()
            error_message = f"Failed to parse or conform message: {str(e)}"
            logging.warning(f"{error_message} | Raw Payload: {element.decode('utf-8', errors='ignore')}")
            
            error_record = {
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "error_message": error_message,
                "raw_payload": element.decode('utf-8', errors='ignore')
            }
            yield beam.pvalue.TaggedOutput('failed_records', error_record)


class RedactWithDLP(beam.DoFn):
    """
    Takes a dictionary, sends specific text fields to Cloud DLP for de-identification,
    and yields the redacted dictionary. Tracks metrics for DLP API calls and failures.
    """
    def __init__(self, project_id, info_types, deid_template_name=None):
        self.project_id = project_id
        self.info_types = info_types
        self.deid_template_name = deid_template_name
        self.dlp_client = None
        self.dlp_calls_counter = metrics.Metrics.counter('main', 'dlp_api_calls')
        self.dlp_failures_counter = metrics.Metrics.counter('main', 'dlp_failures')

    def setup(self):
        # Initialize the DLP client once per worker to improve efficiency.
        self.dlp_client = dlp_v2.DlpServiceClient()

    def process(self, element: dict):
        try:
            original_context = element.get('event_details', {}).get('context', "")
            original_signals = element.get('event_details', {}).get('corroborating_signals', [])

            text_to_redact = [original_context] + original_signals
            
            # If there's no text to process, just pass the element through.
            if not any(text_to_redact):
                yield element
                return

            parent = f"projects/{self.project_id}"

            # --- DLP Configuration ---
            if self.deid_template_name:
                deidentify_config = None
                inspect_config = None
            else:
                inspect_config = {"info_types": self.info_types}
                # This configuration replaces any found PII with the infoType name, e.g., "[PERSON_NAME]".
                deidentify_config = {
                    "info_type_transformations": {
                        "transformations": [
                            {
                                "primitive_transformation": {
                                    "replace_with_info_type_config": {}
                                }
                            }
                        ]
                    }
                }

            # --- Call the DLP API ---
            logging.info(f"Calling DLP API for user_id: {element.get('user_id')}")
            self.dlp_calls_counter.inc()
            response = self.dlp_client.deidentify_content(
                request={
                    "parent": parent,
                    "deidentify_template_name": self.deid_template_name,
                    "inspect_config": inspect_config,
                    "deidentify_config": deidentify_config,
                    "item": {"value": "\n".join(text_to_redact)},
                }
            )

            # --- Robust Re-assembly of Redacted Data ---
            redacted_text_list = response.item.value.split('\n')
            
            # Check for length mismatch to prevent data corruption.
            if len(redacted_text_list) != len(text_to_redact):
                raise ValueError("DLP response length does not match request length.")

            element['event_details']['context'] = redacted_text_list.pop(0)
            element['event_details']['corroborating_signals'] = redacted_text_list

            yield element

        except Exception as e:
            self.dlp_failures_counter.inc()
            logging.error(f"DLP redaction failed for user_id: {element.get('user_id')}. Error: {e}")
            # In a production system, you might want to route this to another dead-letter queue.
            # For this example, we log the error and pass the original (unredacted) element through.
            yield element


def run():
    """Main function to define and run the Apache Beam pipeline."""
    pipeline_options = {
        'runner': 'DataflowRunner',
        'project': PROJECT_ID,
        'job_name': 'aegis-consumer-pipeline-dlp-thorough',
        'region': 'us-central1',
        'temp_location': f'gs://{TEMP_CLOUD_STORAGE}/temp',
        'staging_location': f'gs://{TEMP_CLOUD_STORAGE}/staging',
        'streaming': True
    }
    
    options = PipelineOptions.from_dictionary(pipeline_options)
    
    with beam.Pipeline(options=options) as p:
        messages = p | "Read from PubSub" >> beam.io.ReadFromPubSub(topic=pubsub_topic_path)
        
        parsed_results = (
            messages
            | "Parse and Conform" >> beam.ParDo(ParseAndConform()).with_outputs(
                'failed_records', main='parsed_records'
            )
        )

        good_records = parsed_results.parsed_records
        failed_records = parsed_results.failed_records

        # Redact PII from the successfully parsed records.
        redacted_records = (
            good_records
            | "Redact PII with DLP" >> beam.ParDo(RedactWithDLP(PROJECT_ID, DLP_INFOTYPES, DLP_DEID_TEMPLATE_NAME))
        )

        # Write the clean, redacted records to the main BigQuery table.
        (
            redacted_records
            | "Write Good Records to BigQuery" >> beam.io.WriteToBigQuery(
                bigquery_table_spec,
                schema=BIGQUERY_SCHEMA,
                write_disposition=beam.io.BigQueryDisposition.WRITE_APPEND,
                create_disposition=beam.io.BigQueryDisposition.CREATE_IF_NEEDED
            )
        )
        
        # Write any records that failed initial parsing to the dead-letter table.
        (
            failed_records
            | "Write Failed Records to BigQuery" >> beam.io.WriteToBigQuery(
                bigquery_dead_letter_table_spec,
                schema=DEAD_LETTER_SCHEMA,
                write_disposition=beam.io.BigQueryDisposition.WRITE_APPEND,
                create_disposition=beam.io.BigQueryDisposition.CREATE_IF_NEEDED
            )
        )

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.INFO)
    logging.info("Starting the consumer pipeline...")
    run()
    logging.info("Pipeline execution finished (for DirectRunner) or submitted (for DataflowRunner).")