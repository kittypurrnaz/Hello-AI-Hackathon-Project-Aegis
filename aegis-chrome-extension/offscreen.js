// offscreen.js

// Wait for the document to be fully loaded before running any code
window.addEventListener('DOMContentLoaded', () => {
  console.log('[Offscreen] DOM loaded. Creating sandbox iframe...');
  
  // Create and manage the sandbox iframe
  const iframe = document.createElement('iframe');
  iframe.src = 'sandbox.html';
  document.body.append(iframe); // Now, document.body is guaranteed to exist

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.target === 'offscreen') {
      // Forward the message to the sandbox iframe
      iframe.contentWindow.postMessage(message.data, '*');
    }
  });

  // Listen for messages FROM the sandbox iframe
  window.addEventListener('message', (event) => {
    // Forward the results back to the background script
    chrome.runtime.sendMessage({
      target: 'background',
      data: event.data,
    });
  });
});