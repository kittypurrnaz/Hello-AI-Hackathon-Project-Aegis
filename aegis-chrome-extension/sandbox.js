// --- CHECKPOINT 1: Is the script running at all? ---
console.log('[Sandbox] Script started.');

let model;

// Create an async function to load the model with a fallback.
async function loadModelWithFallback() {
  // --- CHECKPOINT 2: Are we starting the loading process? ---
  console.log('[Sandbox] Starting model load function...');

  // 1. Proactively check if WebGL is available and supported.
  // tf.env().get('WEBGL_VERSION') returns 0 if WebGL is not found.
  const hasWebGL = tf.env().get('WEBGL_VERSION') > 0;

  if (hasWebGL) {
    console.log("WebGL is available. Loading model with default backend.");
  } else {
    // 2. If WebGL is NOT available, force the CPU backend BEFORE loading.
    console.warn("WebGL not available or supported. Forcing CPU backend.");
    await tf.setBackend('cpu');
  }

  // 3. Now, load the model. This is wrapped in a try/catch for other
  // potential issues like network errors during the model download.
  try {
    model = await toxicity.load(0.9);
    // Use tf.getBackend() to confirm which backend was actually used.
    console.log(`Model loaded successfully with '${tf.getBackend()}' backend.`);

    // --- CHECKPOINT 3: Are we calling toxicity.load()? ---
    console.log('[Sandbox] Awaiting toxicity.load()... (This may take a moment)');
    model = await toxicity.load(0.9);
    
    // --- CHECKPOINT 4: Did the model load successfully? ---
    console.log(`[Sandbox] ✅ SUCCESS: Model loaded with '${tf.getBackend()}' backend.`);

  } catch (error) {
    console.error("Failed to load toxicity model:", error);
    // --- CHECKPOINT 5: Did an unrecoverable error occur? ---
    console.error('[Sandbox] ❌ FAILED: Could not load the model.', error);
  }
  
  
  // Send a message to the background script to confirm loading is complete.
  postMessage({ modelLoaded: true });
}

// Run the model loading function.
loadModelWithFallback();

// Listen for messages from the background script.
self.addEventListener('message', (event) => {
  if (event.data && event.data.text && model) {
    const textToAnalyze = event.data.text;
    
    model.classify([textToAnalyze]).then(predictions => {
      // Send the classification results back to the background script.
      postMessage({ predictions: predictions });
    });
  }
});