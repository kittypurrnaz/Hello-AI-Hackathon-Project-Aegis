let model;

async function loadModel() {
  try {
    const hasWebGL = tf.env().get('WEBGL_VERSION') > 0;
    if (!hasWebGL) {
      await tf.setBackend('cpu');
    }
    model = await toxicity.load(0.9);
    console.log(`[Sandbox] Model loaded with '${tf.getBackend()}' backend.`);
    postMessage({ modelLoaded: true });
  } catch (error) {
    console.error("Failed to load toxicity model:", error);
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.text && model) {
    console.log('[Sandbox] 3. Received message, starting analysis.');
    model.classify([event.data.text]).then(predictions => {
      console.log('[Sandbox] 4. Analysis complete, sending predictions back.');
      console.log('[Sandbox] Predictions:', predictions);
      postMessage({ predictions: predictions });
    });
  }
});

loadModel();