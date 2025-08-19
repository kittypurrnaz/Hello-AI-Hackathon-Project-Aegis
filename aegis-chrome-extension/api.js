// api.js
import { config } from './config.js';

/**
 * Analyzes a screenshot using the Gemini Vision API.
 * @param {string} base64Image - The base64 encoded image string.
 * @returns {Promise<object>} - The analysis result from the API.
 */
export async function analyzeScreenshotWithGemini(base64Image) {
  const url = `${config.GEMINI_API_ENDPOINT}?key=${config.GEMINI_API_KEY}`;

  const payload = {
    contents: [{
      parts: [
        { text: "Analyze this webpage screenshot for any of the following: violence, adult content, hate speech, or self-harm imagery. Respond in JSON format with a boolean `isHarmful` and a string `reason` explaining why." },
        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
      ]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error! Status: ${response.status}`);
    }

    const data = await response.json();
    // Safely parse the JSON string from Gemini's text response
    const jsonString = data.candidates[0].content.parts[0].text;
    return JSON.parse(jsonString.replace(/```json|```/g, '').trim());

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { error: error.message };
  }
}

/**
 * Sends the final analysis report to your frontend API.
 * @param {object} reportData - The complete, categorized report.
 * @returns {Promise<object>} - The response from your server.
 */
export async function sendResultsToFrontend(reportData) {
  try {
    const response = await fetch(config.FRONTEND_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });

    if (!response.ok) {
      throw new Error(`Frontend API error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending data to frontend:', error);
    return { error: error.message };
  }
}