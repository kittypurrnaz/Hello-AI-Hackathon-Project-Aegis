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
  const { type, url, payload } = event.data;

  if (!url) return;

  // Ensure a report object exists for this URL
  if (!reports.has(url)) {
      reports.set(url, { url, timestamp: new Date().toISOString() });
  }
  let currentReport = reports.get(url);

  // Handle different message types
  switch (type) {
      case 'url_analysis_request':
          currentReport.urlAnalysis = await analyzeUrlInSandbox(url);
          break;
      case 'screenshot_result':
          currentReport.screenshotAnalysis = payload;
          break;
      case 'history_result':
          currentReport.historyAnalysis = payload;
          break;
  }
  
  // Check if all three parts of the report are complete
  if (currentReport.urlAnalysis && currentReport.screenshotAnalysis && currentReport.historyAnalysis) {
      console.log('[Sandbox] All data collected for', url);
      const finalReport = mergeAndCategorize(currentReport);
      await sendResultsToFrontend(finalReport);
      reports.delete(url); // Clean up the completed report
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
  const flaggedCategories = new Set(); // Use a Set to avoid duplicate categories

  // Helper function to check for keywords in analysis results
  const checkForFlags = (text, categories) => {
    for (const category of categories) {
      if (text.toLowerCase().includes(category.toLowerCase())) {
        flaggedCategories.add(category);
      }
    }
  };

  // 1. Check URL/Text analysis from TensorFlow.js
  if (report.urlAnalysis && !report.urlAnalysis.error) {
    report.urlAnalysis.forEach(prediction => {
      if (prediction.results[0].match === true) {
        checkForFlags(prediction.label, [...config.IMMEDIATE_CATEGORIES, ...config.INTERMEDIATE_CATEGORIES]);
      }
    });
  }

  // 2. Check Screenshot analysis from Gemini
  if (report.screenshotAnalysis && report.screenshotAnalysis.reason) {
     checkForFlags(report.screenshotAnalysis.reason, [...config.IMMEDIATE_CATEGORIES, ...config.INTERMEDIATE_CATEGORIES]);
  }
  
  // 3. Determine final severity
  for (const category of flaggedCategories) {
    if (config.IMMEDIATE_CATEGORIES.includes(category)) {
      severity = 'immediate';
      break; // Immediate severity overrides all others
    }
    if (config.INTERMEDIATE_CATEGORIES.includes(category)) {
      severity = 'intermediate';
    }
  }
  
  report.severity = severity;
  report.flaggedCategories = Array.from(flaggedCategories);
  return report;
}

// MOVED: This function was moved here from background.js
async function sendResultsToFrontend(reportData) {
  console.log(`[Sandbox] Report categorized as '${reportData.severity}'. Routing accordingly.`);

  switch (reportData.severity) {
    case 'immediate':
      // For high severity, send directly to the frontend.
      console.log('[Sandbox] Sending immediate alert to frontend...');
      try {
        await fetch(config.IMMEDIATE_REPORT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        });
        console.log('[Sandbox] Immediate alert sent successfully.');
      } catch (error) {
        console.error('[Sandbox] Failed to send immediate alert:', error);
      }
      break;

    case 'intermediate':
      // For medium severity, send to the database first, then the frontend.
      console.log('[Sandbox] Sending intermediate report to database...');
      try {
        const dbResponse = await fetch(config.INTERMEDIATE_STORAGE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        });

        if (!dbResponse.ok) throw new Error('Database API failed.');
        
        console.log('[Sandbox] Report stored in database. Now sending to frontend...');
        
        // After successfully saving to DB, forward to frontend.
        await fetch(config.IMMEDIATE_REPORT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData)
        });

        console.log('[Sandbox] Intermediate report sent to frontend successfully.');
      } catch (error) {
        console.error('[Sandbox] Failed to process intermediate report:', error);
      }
      break;

    case 'low':
      // For low severity, do nothing.
      console.log('[Sandbox] Low severity report. No action taken.');
      break;
  }
}