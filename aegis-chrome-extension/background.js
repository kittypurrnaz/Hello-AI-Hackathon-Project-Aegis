let hostTabId = null;
const hostUrl = chrome.runtime.getURL('host.html');

async function getOrCreateHostTab() {
  const tabs = await chrome.tabs.query({ url: hostUrl });
  if (tabs.length > 0) {
    hostTabId = tabs[0].id;
    return;
  }
  const tab = await chrome.tabs.create({
    url: hostUrl,
    pinned: true,
    active: false
  });
  hostTabId = tab.id;
}

chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0 || !details.url.startsWith('http')) {
    return;
  }
  
  if (!hostTabId) {
    await getOrCreateHostTab();
  }
  
  try {
    await chrome.tabs.get(hostTabId);
    console.log(`[Background] 1. Sending URL for analysis: ${details.url}`);
    chrome.tabs.sendMessage(hostTabId, { text: details.url });
  } catch (error) {
    console.warn("Host tab not found, recreating...");
    await getOrCreateHostTab();
    chrome.tabs.sendMessage(hostTabId, { text: details.url });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.predictions) {
    console.log('[Background] 6. Received final predictions.');
    message.predictions.forEach(prediction => {
      if (prediction.results[0].match) {
        console.warn(`Harmful content detected! Label: ${prediction.label}`);
      }
    });
  }
});

getOrCreateHostTab();