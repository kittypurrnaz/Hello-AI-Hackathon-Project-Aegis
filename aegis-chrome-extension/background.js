// background.js

import { config } from './config.js';
import { analyzeScreenshotWithGemini } from './api.js';

const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

// --- Offscreen Document Setup for TensorFlow.js ---
async function setupOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
  if (existingContexts.length > 0) return;
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ['IFRAME_SCRIPTING'],
    justification: 'To run TensorFlow.js for URL analysis.',
  });
}

chrome.runtime.onStartup.addListener(setupOffscreenDocument);
setupOffscreenDocument();

async function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      // Add more robust error checking
      if (chrome.runtime.lastError) {
        console.error("getAuthToken failed:", chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError);
      } else if (!token) {
        console.error("Authentication failed: Token was empty.");
        reject(new Error("Authentication failed: Token was empty."));
      } else {
        resolve(token);
      }
    });
  });
}

// --- State Management and UI Communication ---

// 1. Listen for messages from the popup (index.html)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleMonitoring') {
    // Get the current state
    chrome.storage.local.get('monitoringEnabled', (data) => {
      const isEnabled = !data.monitoringEnabled;

      // Update the state in storage
      chrome.storage.local.set({ monitoringEnabled: isEnabled }, () => {
        console.log('Monitoring status set to ' + isEnabled);
      });
    });
  }
});

// 2. Initialize the state when the extension is first installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ monitoringEnabled: true });
});

// --- Main Event Listener with State Check ---
// The core logic now only runs if the monitoring is enabled.
// background.js

chrome.webNavigation.onCompleted.addListener(async (details) => {
  // Only check top-level navigation to web pages
  if (details.frameId !== 0 || !details.url.startsWith('http')) {
    return;
  }

  // Use a Promise to get the storage value in a way that works with async/await
  const data = await new Promise(resolve => {
    chrome.storage.local.get('monitoringEnabled', result => resolve(result));
  });

  // Only proceed if the toggle is ON
  if (data.monitoringEnabled) {
    console.log(`[Background] Navigation completed: ${details.url}`);

    try {
      // 1. Get the auth token first.
      console.log("Attempting to get auth token...");
      const authToken = await getAuthToken();
      if (!authToken) {
        console.log("Could not acquire auth token. Aborting analysis.");
        return; // Exit if authentication fails
      }
      console.log("Auth token acquired. Proceeding with analysis.");

      // 2. Send the URL to the offscreen document for its analysis.
      chrome.runtime.sendMessage({
        target: 'offscreen',
        data: { type: 'url_analysis_request', url: details.url }
      });

      // 3. Perform screenshot analysis, passing the authToken.
      const screenshotAnalysis = await analyzeScreenshot(details.tabId, authToken);
      chrome.runtime.sendMessage({
          target: 'offscreen',
          data: { type: 'screenshot_result', url: details.url, payload: screenshotAnalysis }
      });

      // 4. Perform history analysis and forward the result.
      const historyAnalysis = await analyzeHistory();
       chrome.runtime.sendMessage({
          target: 'offscreen',
          data: { type: 'history_result', url: details.url, payload: historyAnalysis }
      });

    } catch (error) {
      console.error("Failed to authenticate or analyze:", error.message);
    }
  }
});

// --- Screenshot and History analysis functions remain unchanged ---
async function analyzeScreenshot(tabId, authToken) {
    try {
        const tab = await chrome.tabs.get(tabId);
        if (!tab.active) {
            console.log(`[Background] Screenshot skipped for tab ${tabId} because it's not the active tab.`);
            return { status: 'skipped', reason: 'Tab not active' };
        }
        const screenshotDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { 
            format: 'jpeg',
            quality: 80
        });
        const base64Image = screenshotDataUrl.split(',')[1];
        return await analyzeScreenshotWithGemini(base64Image, authToken);
    } catch (error) {
        console.error('Error capturing or analyzing screenshot:', error);
        return { error: `Failed to analyze screenshot: ${error.message || 'Unknown error'}` };
    }
}
async function analyzeHistory() {
  try {
    const historyItems = await chrome.history.search({ text: '', maxResults: config.HISTORY_ANALYSIS_COUNT });
    const keywordCounts = {};
    const keywords = ['news', 'games', 'social', 'work', 'education'];
    historyItems.forEach(item => {
        keywords.forEach(keyword => {
            if (item.title && item.title.toLowerCase().includes(keyword)) {
                keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
            }
        });
    });
    return { summary: 'Keyword frequency analysis', counts: keywordCounts };
  } catch (error) {
      console.error('Error analyzing history:', error);
      return { error: `Failed to analyze history: ${error.message}` };
  }
}
