// in offscreen.js

console.log('[Offscreen] Script started. Creating sandbox iframe...');
const iframe = document.createElement('iframe');
iframe.id = 'sandbox';
iframe.src = 'sandbox.html';
document.body.appendChild(iframe);

// We are temporarily disabling the normal message listeners to run this test.
/*
let messageQueue = [];
let isSandboxReady = false;
chrome.runtime.onMessage.addListener(...)
*/

// --- FORCEFUL PING TEST ---
// After 3 seconds, we'll start pinging the sandbox every second.
setTimeout(() => {
    console.log('[Offscreen] Starting ping test...');
    setInterval(() => {
        const sandboxIframe = document.getElementById('sandbox');
        // Make sure the iframe and its content window are available before sending.
        if (sandboxIframe && sandboxIframe.contentWindow) {
            console.log('[Offscreen] --> Pinging sandbox...');
            sandboxIframe.contentWindow.postMessage({ text: 'ping' }, '*');
        } else {
            console.warn('[Offscreen] Ping test failed: Could not find sandbox iframe.');
        }
    }, 1000); // Ping every 1 second
}, 3000); // Start the test after 3 seconds to give the iframe time to load.

// This listener for messages FROM the sandbox is still active.
window.addEventListener('message', (event) => {
    if (event.data.modelLoaded) {
        console.log('[Offscreen] <-- Received modelLoaded signal from sandbox.');
    } else if (event.data.predictions) {
        console.log('[Offscreen] <-- Received predictions from sandbox:', event.data.predictions);
    }
});