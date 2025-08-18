// The path to your offscreen document
const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

// A function to create the offscreen document if it doesn't exist
async function setupOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  if (existingContexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ['IFRAME_SCRIPTING'],
    justification: 'To host the sandboxed iframe for TensorFlow.js',
  });
}

// Set up the offscreen document when the extension is installed
chrome.runtime.onInstalled.addListener(setupOffscreenDocument);

// Listen for browser history visits
chrome.history.onVisited.addListener(async (historyItem) => {
  // Ensure the offscreen document is running
  await setupOffscreenDocument();

  const pageTitle = historyItem.title;
  if (!pageTitle) return;

  // Send the page title to the offscreen document, which will forward it to the sandbox
  chrome.runtime.sendMessage({
    target: 'offscreen',
    data: { text: pageTitle }
  });
});

// Listen for the final results forwarded from the offscreen document
chrome.runtime.onMessage.addListener((message) => {
  if (message.predictions) {
    const predictions = message.predictions;

    predictions.forEach(prediction => {
      if (prediction.results[0].match) {
        console.warn(`Harmful content detected! Label: ${prediction.label}`);
      }
    });
  }
});