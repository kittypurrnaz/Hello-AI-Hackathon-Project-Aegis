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


// --- Main Event Listener ---
// EDITED: This listener now forwards analysis results to the sandbox instead of processing them.
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0 || !details.url.startsWith('http')) {
    return;
  }
  console.log(`[Background] Navigation completed: ${details.url}`);

  // 1. Send the URL to the sandbox to begin its own analysis.
  chrome.runtime.sendMessage({
    target: 'offscreen',
    data: { type: 'url_analysis_request', url: details.url }
  });

  // 2. Perform screenshot analysis and forward the result.
  const screenshotAnalysis = await analyzeScreenshot(details.tabId);
  chrome.runtime.sendMessage({
      target: 'offscreen',
      data: { type: 'screenshot_result', url: details.url, payload: screenshotAnalysis }
  });

  // 3. Perform history analysis and forward the result.
  const historyAnalysis = await analyzeHistory();
   chrome.runtime.sendMessage({
      target: 'offscreen',
      data: { type: 'history_result', url: details.url, payload: historyAnalysis }
  });
});


// --- Screenshot and History analysis functions remain ---
// They are needed to gather data before forwarding it.

async function analyzeScreenshot(tabId) {
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
        return await analyzeScreenshotWithGemini(base64Image);

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

// REMOVED: analyzeUrl, mergeAndCategorize, and final data handling logic are no longer needed here.