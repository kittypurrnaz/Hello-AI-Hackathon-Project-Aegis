// storage.js

/**
 * Saves a report to local storage. Each report gets a unique key.
 * @param {object} reportData - The analysis report to save.
 */
export async function saveData(reportData) {
  try {
    // Create a unique key using a timestamp
    const key = `report_${new Date().toISOString()}`;
    await chrome.storage.local.set({ [key]: reportData });
    console.log('Data saved successfully with key:', key);
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

/**
 * Retrieves all saved reports.
 * @returns {Promise<object[]>} - An array of all reports.
 */
export async function getAllData() {
  try {
    const allItems = await chrome.storage.local.get(null);
    return Object.values(allItems);
  } catch (error) {
    console.error('Failed to retrieve data:', error);
    return [];
  }
}