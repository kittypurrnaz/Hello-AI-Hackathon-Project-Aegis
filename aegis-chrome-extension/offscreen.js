// This script runs in the offscreen document.

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(handleMessages);

function handleMessages(message, sender, sendResponse) {
  if (message.target !== 'offscreen') {
    return;
  }

  // Forward the message to the sandbox iframe
  const sandboxIframe = document.getElementById('sandbox');
  if (sandboxIframe) {
    sandboxIframe.contentWindow.postMessage(message.data, '*');
  }
}

// Create the sandbox iframe
const iframe = document.createElement('iframe');
iframe.id = 'sandbox';
iframe.src = 'sandbox.html';
document.body.appendChild(iframe);

// Listen for results coming back from the sandbox
window.addEventListener('message', (event) => {
  // Forward the results to the background script
  chrome.runtime.sendMessage({ predictions: event.data.predictions });
});