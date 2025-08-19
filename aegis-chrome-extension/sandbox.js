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