let model;

// Load the model as soon as the sandbox is created
toxicity.load(0.9).then(loadedModel => {
  model = loadedModel;
  // Send a message to the background script to confirm loading is complete
  postMessage({ modelLoaded: true });
});

// Listen for messages from the background script
self.addEventListener('message', (event) => {
  if (event.data && event.data.text && model) {
    const textToAnalyze = event.data.text;

    model.classify([textToAnalyze]).then(predictions => {
      // Send the classification results back to the background script
      postMessage({ predictions: predictions });
    });
  }
});