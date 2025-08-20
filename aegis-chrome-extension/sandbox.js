// sandbox.js
// NOTE: You may need to make 'config.js' available to the sandbox if it's not already.

// For example, by moving it to a web accessible location. For now, we'll assume it is.
const config = {
  FRONTEND_API_ENDPOINT: 'https://your-frontend-api.com/api/report', // Example endpoint
};

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
      const response = await fetch(config.FRONTEND_API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
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

    Your Instructions:
    1.  Analyze the combined raw data to determine if a threat exists.
    2.  If the threat is severe (e.g., self-harm, gore, drugs), classify it as an "IMMEDIATE_FLAG".
    3.  If the threat is less severe (e.g., nsfw, hurtful language), classify it as an "INTERMEDIATE_FLAG".
    4.  Select the most fitting 'flag_type' and 'topic_category'.
    5.  Estimate a 'confidence' score from 0.0 to 1.0.
    6.  The 'user_id' should be "hashed_user_id_12345".
    7.  Your entire response must be ONLY the JSON object, with no extra text or markdown formatting.

    Use one of the following two formats for your response:

    IMMEDIATE_FLAG Format:
    {
      "user_id": "hashed_user_id_12345",
      "timestamp": "${new Date().toISOString()}",
      "signal_type": "IMMEDIATE_FLAG",
      "flag_type": "SELF_HARM_IDEATION",
      "confidence": 0.98,
      "topic_category": "Mental Health & Well-being",
      "source_platform": "Chrome Extension",
      "event_details": {
        "context": "multiple searches and browsing activity",
        "corroborating_signals": ["low messaging volume"]
      }
    }

    INTERMEDIATE_FLAG Format:
    {
      "user_id": "hashed_user_id_12345",
      "timestamp": "${new Date().toISOString()}",
      "signal_type": "INTERMEDIATE_FLAG",
      "flag_type": "HURTFUL_LANGUAGE",
      "confidence": 0.85,
      "topic_category": "Social Dynamics",
      "source_platform": "Chrome Extension",
      "event_details": {
        "context": "sustained pattern of negative sentiment"
      }
    }
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