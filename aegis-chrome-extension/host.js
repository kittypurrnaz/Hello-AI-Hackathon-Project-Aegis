// in host.js

// Create the sandbox iframe.
const iframe = document.createElement('iframe');
iframe.src = 'sandbox.html';
document.body.appendChild(iframe);

// Listen for messages FROM the background script.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.text) {
    console.log('[Host] 2. Received URL from background, forwarding to sandbox.');
    iframe.contentWindow.postMessage({ text: message.text }, '*');
  }
});


// --- NEW DIAGNOSTIC LISTENER ---
// This listener will log every message event that reaches the host page.
window.addEventListener('message', (event) => {
  console.log('[Host] A message event was received!', event);
  
  // Let's inspect the event object to see where it came from and what it contains.
  console.log('[Host] Message Origin:', event.origin);
  console.log('[Host] Message Data:', event.data);

  // This is the original logic to check for the prediction data.
  if (event.data && event.data.predictions) {
    console.log('[Host] 5. Received predictions from sandbox, forwarding to background.');
    chrome.runtime.sendMessage({ predictions: event.data.predictions });
  } else {
    console.log('[Host] Received a message, but it did not contain the expected predictions.');
  }
});