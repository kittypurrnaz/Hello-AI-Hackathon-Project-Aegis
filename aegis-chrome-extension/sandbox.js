// sandbox.js
// NOTE: You may need to make 'config.js' available to the sandbox if it's not already.

// For example, by moving it to a web accessible location. For now, we'll assume it is.
const config = {
  BQ_API_ENDPOINT: 'https://aegis-ingestion-api-943089436637.us-central1.run.app/', // Example endpoint
};

const immediateCategory = [
  {
    "activity": "SUICIDE",
    "corroborating_signals": [
      "Searching for painless suicide methods.",
      "Visiting online forums about hopelessness.",
      "Researching lethal dosages of painkillers.",
      "Posting cryptic goodbye messages or song lyrics.",
      "Making online arrangements for pet care."
    ]
  },
  {
    "activity": "GORE",
    "corroborating_signals": [
      "Searching for uncensored accident/execution videos.",
      "Spending excessive time on shock sites.",
      "Bookmarking links to graphic content.",
      "Disabling SafeSearch for graphic image searches.",
      "Downloading collections of real-life violent footage."
    ]
  },
  {
    "activity": "DRUGS",
    "corroborating_signals": [
      "Searching for dark web drug markets.",
      "Researching how to buy cryptocurrency anonymously.",
      "Online purchases of scales, baggies, or pipes.",
      "Using web-based encrypted messaging with coded language.",
      "Searching for home synthesis guides for narcotics."
    ]
  },
  {
    "activity": "CHILD_ABUSE",
    "corroborating_signals": [
      "Searching for specific types of illegal child abuse material.",
      "Attempting to access known child abuse forums.",
      "Searching for ways to bypass parental controls.",
      "Using web anonymizing tools like VPNs or proxies.",
      "Uploading encrypted files to anonymous sharing sites."
    ]
  },
  {
    "activity": "VIOLENCE",
    "corroborating_signals": [
      "Researching homemade weapons or 3D printed guns.",
      "Repeatedly watching manifestos of past attackers.",
      "Visiting extremist forums discussing violence.",
      "Using Google Maps to scout public locations.",
      "Downloading terrorist or anarchist handbooks."
    ]

  },
  {
    "activity": "ILLEGAL_ACTIVITY",
    "corroborating_signals": [
      "Searching 'how to money launder' or 'shell corporations.'",
      "Using web-based cryptocurrency tumblers/mixers.",
      "Visiting forums selling stolen credit card data.",
      "Using web tools to generate fake IDs.",
      "Researching how to perform SIM-swapping attacks."
    ]
  },
  {
    "activity": "EXTREMISM",
    "corroborating_signals": [
      "YouTube history shows descent into radical content.",
      "Searching for conspiracy theories or to debunk historical events.",
      "Downloading extremist manifestos and propaganda.",
      "Visiting websites of known extremist groups.",
      "Bookmarking social media posts with dehumanizing language."
    ]
  },
  {
    "activity": "SELF_INJURY",
    "corroborating_signals": [
      "Searching 'how to hide scars' or 'how to cut deeper.'",
      "Frequent visits to pro-self-harm blogs or forums.",
      "Image-searching for graphic self-inflicted wounds.",
      "Bookmarking threads on how to perform self-harm.",
      "Buying small hidden knives or razors online."
    ]
  },
  {
    "activity": "DANGEROUS_CHALLENGE",
    "corroborating_signals": [
      "Repeatedly watching a specific viral challenge video.",
      "Searching 'how to do [challenge name] safely.'",
      "Visiting forums where users share tips for challenges.",
      "Online purchases of items needed for the challenge.",
      "Bookmarking news articles about injuries from the challenge."
    ]
  }
]

const intermediateCategory = [
  {
    "activity": "NSFW",
    "corroborating_signals": [
      "Visiting known adult websites.",
      "Searching for explicit or pornographic terms.",
      "Disabling SafeSearch in Google settings.",
      "Repeatedly clearing browser history after visits.",
      "Clicking on explicit ad banners."
    ]
  },
  {
    "activity": "SMUT",
    "corroborating_signals": [
      "Searching for specific pornographic genres.",
      "Spending significant time on tube sites.",
      "Bookmarking links to adult content.",
      "Using Incognito mode for specific site visits.",
      "Downloading videos from adult websites."
    ]
  },
  {
    "activity": "HURTFUL_LANGUAGE_PATTERN",
    "corroborating_signals": [
      "Using slurs in web forms or comment sections.",
      "Searching for new or creative insults.",
      "Bookmarking pages with lists of offensive terms.",
      "Frequent visits to toxic online forums (e.g., 4chan).",
      "Searching for offensive memes."
    ]
  },
  {
    "activity": "RACIAL_INSULTS",
    "corroborating_signals": [
      "Searching for specific racial slurs.",
      "Visiting websites of known hate groups.",
      "Leaving racist comments on news articles.",
      "Sharing racist memes or content.",
      "Watching and liking extremist video content."
    ]
  },
  {
    "activity": "CYBERBULLYING",
    "corroborating_signals": [
      "Repeatedly visiting a specific person's social media.",
      "Searching for a target's personal information (doxing).",
      "Creating fake social media profiles.",
      "Using web apps to send anonymous, harassing messages.",
      "Screenshotting a target's posts for ridicule."
    ]
  },
  {
    "activity": "MISINFORMATION",
    "corroborating_signals": [
      "Frequent visits to known conspiracy or fake news sites.",
      "Searching for \"alternative facts\" about major events.",
      "Sharing links from disreputable sources on social media.",
      "Watching and engaging with conspiracy theory videos.",
      "Bookmarking debunked articles as 'proof'."
    ]
  },
  {
    "activity": "SPAM",
    "corroborating_signals": [
      "Using web-based 'email bomber' tools.",
      "Searching for 'buy bulk email lists'.",
      "Visiting forums on black-hat marketing techniques.",
      "Creating multiple disposable email accounts.",
      "Purchasing web domains for phishing campaigns."
    ]
  },
  {
    "activity": "HARASSMENT",
    "corroborating_signals": [
      "Obsessively searching a person's name.",
      "Searching for a target's home address or phone number.",
      "Repeatedly creating new accounts to contact someone.",
      "Leaving hateful comments on a target's public profiles.",
      "Bookmarking a target's friends' and family's profiles."
    ]
  },
  {
    "activity": "INAPPROPRIATE_CONTENT",
    "corroborating_signals": [
      "Visiting shock sites with violent or disturbing media.",
      "Searching for real-life accident or crime scene photos.",
      "Watching videos of animal cruelty.",
      "Engaging with content that promotes eating disorders.",
      "Reading forums that glorify violence or illegal acts."
    ]
  },
  {
    "activity": "HATEFUL_CONDUCT",
    "corroborating_signals": [
      "Participating in hate forums or chan boards.",
      "Downloading extremist literature or manifestos.",
      "Creating and sharing content that demeans protected groups.",
      "Following and interacting with extremist influencers.",
      "Searching for justifications for hate crimes."
    ]
  }
]

const IMMEDIATE_FLAG_TYPES = [
    "SUICIDE", "GORE", "DRUGS", "CHILD_ABUSE", "VIOLENCE", 
    "ILLEGAL_ACTIVITY", "EXTREMISM", "SELF_INJURY", "DANGEROUS_CHALLENGE"
]
const INTERMEDIATE_FLAG_TYPES = [
    "NSFW", "SMUT", "HURTFUL_LANGUAGE_PATTERN", "RACIAL_INSULTS", 
    "CYBERBULLYING", "MISINFORMATION", "SPAM", "HARASSMENT", 
    "INAPPROPRIATE_CONTENT", "HATEFUL_CONDUCT"
]

// --- State Management ---
const reports = new Map();
const modelPromise = toxicity.load(0.9);

modelPromise.then(() => {
  console.log('[Sandbox] Toxicity model is ready for analysis.');
}).catch(err => {
  console.error('[Sandbox] FATAL: Failed to load toxicity model:', err);
});


// EDITED: The message listener now handles multiple data types to assemble a full report.
self.addEventListener('message', async (event) => {
  const { type, url, payload, authToken } = event.data; // authToken can now be received

  if (!url) return;

  if (!reports.has(url)) {
      reports.set(url, { url, timestamp: new Date().toISOString() });
  }
  let currentReport = reports.get(url);

  switch (type) {
      case 'url_analysis_request':
          //currentReport.urlAnalysis = await analyzeUrlInSandbox(url);
          currentReport.urlAnalysis = payload;
          // CORRECTED: Store the received authToken with the report
          if (authToken) {
            currentReport.authToken = authToken;
          }
          break;
      case 'screenshot_result':
          currentReport.screenshotAnalysis = payload;
          // CORRECTED: Store the received authToken with the report
          if (authToken) {
            currentReport.authToken = authToken;
          }
          break;
      case 'history_result':
          currentReport.historyAnalysis = payload;
          break;
  }
  
  // Check if all parts of the report are complete
  if (currentReport.urlAnalysis && currentReport.screenshotAnalysis && currentReport.historyAnalysis) {
      console.log('[Sandbox] All data collected for', url);

      // CORRECTED: Ensure the authToken exists before proceeding
      if (currentReport.authToken) {
        // Retrieve the stored token and pass it to generateJsonReport
        const finalReportData = await generateJsonReport(currentReport, currentReport.authToken);
        
        console.log('[Sandbox] Final report generated:', finalReportData);

        // Now you can use either the original data (currentReport) or the new one (finalReportData)
        // Let's assume you want to send the newly structured report.
        await sendResultsToFrontend(finalReportData);

        reports.delete(url); // Clean up
      } else {
        console.error("[Sandbox] Cannot generate final report: Auth token is missing.");
        reports.delete(url); // Clean up failed report
      }
  }
});


// --- Analysis and Reporting Functions ---

async function analyzeUrlInSandbox(url) {
  try {
      const model = await modelPromise;
      const textToAnalyze = url.replace(/https?:\/\/(www\.)?/, '').replace(/[\/\.\-]/g, ' ');
      return await model.classify([textToAnalyze]);
  } catch (error) {
      console.error(`[Sandbox] TF.js analysis failed for ${url}:`, error);
      return { error: error.message };
  }
}

// MOVED: This function was moved here from background.js
function mergeAndCategorize(report) {
  let severity = 'low';
  const issues = [];

  if (report.urlAnalysis && !report.urlAnalysis.error) {
      report.urlAnalysis.forEach(pred => {
          if (pred.results[0].match === true) {
              issues.push(`URL text flagged for: ${pred.label}`);
          }
      });
  }

  if (report.screenshotAnalysis && report.screenshotAnalysis.isHarmful) {
      issues.push(`Screenshot flagged for: ${report.screenshotAnalysis.reason}`);
  }

  if (issues.length > 2) {
      severity = 'immediate';
  } else if (issues.length > 0) {
      severity = 'intermediate';
  }
  
  report.severity = severity;
  report.issues = issues;
  return report;
}

// MOVED: This function was moved here from background.js
async function sendResultsToFrontend(reportData) {
  // This will ONLY work if you modify manifest.json to allow network requests from the sandbox.
  console.log('[Sandbox] Sending final report to frontend:', reportData);
  try {
      const response = await fetch(config.BQ_API_ENDPOINT + 'upload_data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([reportData])
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      console.log('[Sandbox] Report sent successfully.');
  } catch (error) {
      console.error('[Sandbox] Failed to send report:', error);
  }
}

// This function takes the raw analysis data and instructs Gemini to format it.
async function generateJsonReport(analysisData, authToken) {
  // --- Replace with your project details ---
  const projectId = 'trainee-project-tianyi';
  const location = 'us-central1';
  const modelId = 'gemini-2.5-flash'; // Use a powerful model for best results

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

  // 1. Construct a detailed prompt with the analysis data and JSON templates
  const prompt = `
    Act as a safety analysis AI. Based on the following raw data, generate a single JSON object.

    Raw Data:
    - URL/Text Analysis: ${JSON.stringify(analysisData.urlAnalysis)}
    - Visual Analysis: ${JSON.stringify(analysisData.screenshotAnalysis)}
    - History Analysis: ${JSON.stringify(analysisData.historyAnalysis)}

    - Immediate Flag Types: ${JSON.stringify(IMMEDIATE_FLAG_TYPES)}
    - Intermediate Flag Types: ${JSON.stringify(INTERMEDIATE_FLAG_TYPES)}
    - Immediate Corroborating Signals: ${JSON.stringify(immediateCategory)}
    - Intermediate Corroborating Signals: ${JSON.stringify(intermediateCategory)}

    Your Instructions:
    1.  Analyze the combined raw data to determine if a threat exists.
    2.  If the threat is found in Immediate Flag Types, classify it as an "IMMEDIATE_FLAG".
    3.  If the threat is found in Intermediate Flag Types, classify it as an "INTERMEDIATE_FLAG".
    4.  If no threat is found, classify it as "NEUTRAL_FLAG" for both flag_type and signal_type.
    5.  Select the most fitting 'flag_type' and 'topic_category'. 
    6.  Estimate a 'confidence' score from 0.0 to 1.0.
    7.  The 'user_id' should be "hashed_user_id_0000x", the x alternating between 1 or 2 randomized.
    8.  Your entire response must be ONLY the JSON object, with no extra text or markdown formatting.
    9.  Use the examples in the Immediate Corroborating Signals section to guide your classification by matching the activity to the flag_type. Just one element is enough.

    Use this for your response:

    Format:
    {
      "user_id": "hashed_user_id_12345",
      "timestamp": "${new Date().toISOString()}",
      "signal_type": "SIGNAL_TYPE",
      "flag_type": "FLAG_TYPE",
      "confidence": 0,
      "topic_category": "Topic Category",
      "source_platform": "Chrome Extension",
      "event_details": {
        "context": "Context here",
        "corroborating_signals": ["Corroborating signal"]
      }
    }

    Make sure that the format is exactly as shown, with no additional text or formatting, and acceptable
    in Pydantic Model format.
  `;

  // 2. Create the payload for the API
  const payload = {
    contents: [{
      "role": "user",
      parts: [{ "text": prompt }]
    }]
  };

  // 3. Make the API call
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Vertex AI API error! Status: ${response.status} - ${JSON.stringify(errorBody)}`);
    }

    const data = await response.json();
    const jsonString = data.candidates[0].content.parts[0].text;
    return JSON.parse(jsonString.replace(/```json|```/g, '')); // The model returns the JSON directly

  } catch (error) {
    console.error('Error generating JSON report:', error);
    return { error: error.message };
  }
}