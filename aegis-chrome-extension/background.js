// This function is called whenever a user visits a new URL.
chrome.history.onVisited.addListener((historyItem) => {
  console.log("User visited:", historyItem.url);

  // You can access the URL and title of the page.
  const visitedUrl = historyItem.url;
  const pageTitle = historyItem.title;

  // Now, you can analyze the URL or title for harmful content.
  checkForHarmfulContent(visitedUrl, pageTitle);

  // You can also save the Browse history for later review.
  saveHistory(historyItem);
});

/**
 * A simple function to check for keywords in the URL or title.
 * For a real application, you would use a more sophisticated method.
 */
function checkForHarmfulContent(url, title) {
  const harmfulKeywords = ["violence", "adult content", "hate speech"]; // Example list
  const textToAnalyze = (url + " " + title).toLowerCase();

  for (const keyword of harmfulKeywords) {
    if (textToAnalyze.includes(keyword)) {
      console.warn("Potentially harmful content detected:", url);
      // Here you could trigger a notification or block the site.
      // Note: Blocking requires additional permissions and logic.
      break;
    }
  }
}

/**
 * Saves the visited page information into the extension's local storage.
 */
function saveHistory(historyItem) {
  // Get the existing history from storage.
  chrome.storage.local.get({ monitoredHistory: [] }, (result) => {
    const history = result.monitoredHistory;
    history.push({
      url: historyItem.url,
      title: historyItem.title,
      timestamp: new Date().toISOString()
    });

    // Save the updated history back to storage.
    chrome.storage.local.set({ monitoredHistory: history });
  });
}