// api.js
import { config } from './config.js';

/**
 * Analyzes a screenshot using the Gemini Vision API.
 * @param {string} base64Image - The base64 encoded image string.
 * @returns {Promise<object>} - The analysis result from the API.
 */
export async function analyzeScreenshotWithGemini(base64Image, authToken) {
  // CORRECTED: The endpoint should use ':generateContent'
  const url = `https://${config.GEMINI_API_LOCATION}-aiplatform.googleapis.com/v1/projects/${config.GEMINI_PROJECT_ID}/locations/${config.GEMINI_API_LOCATION}/publishers/google/models/${config.GEMINI_API_MODEL}:generateContent`

  // CORRECTED: The payload for Vertex AI requires the "role" field
  const payload = {
    contents: [{
      "role": "user",
      parts: [
        { text: "Analyze this webpage screenshot for any of the following: violence, adult content, hate speech, or self-harm imagery. Respond in JSON format with a boolean `isHarmful` and a string `reason` explaining why." },
        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
      ]
    }]
  };
  console.log(url, payload);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        // CORRECTED: You MUST include an Authorization header
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // It's helpful to log the response body for more detailed errors
      const errorBody = await response.json();
      throw new Error(`Gemini API error! Status: ${response.status} - ${JSON.stringify(errorBody)}`);
    }

    const data = await response.json();
    // The response structure for generateContent might be slightly different.
    // It's safer to check for the candidates array before accessing it.
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Invalid response from Gemini API: No candidates found.");
    }
    const jsonString = data.candidates[0].content.parts[0].text;
    return JSON.parse(jsonString.replace(/```json|```/g, '').trim());

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { error: error.message };
  }
}

// api.js

export async function analyzeUrlWithGemini(urlToAnalyze, authToken) {
  const url = `https://${config.GEMINI_API_LOCATION}-aiplatform.googleapis.com/v1/projects/${config.GEMINI_PROJECT_ID}/locations/${config.GEMINI_API_LOCATION}/publishers/google/models/${config.GEMINI_API_MODEL}:generateContent`;

  const prompt = `
    Analyze the following URL's text for any toxicity: "${urlToAnalyze}". 
    Analyze this webpage screenshot for any of the following: violence, adult content, hate speech, or self-harm imagery."
    Respond in JSON format with a boolean \`isHarmful\` and a string \`reason\` explaining why.
    Respond with a simple JSON object indicating if it's harmful, like {"isHarmful": true, "reason": "Contains toxic language"}. 
    If not harmful, respond with {"isHarmful": false, "reason": "No toxic content found"}.
  `;

  const payload = {
    contents: [{
      "role": "user",
      parts: [{ "text": prompt }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Vertex AI API error! Status: ${response.status} - ${JSON.stringify(errorBody)}`);
    }

    const data = await response.json();
    const jsonString = data.candidates[0].content.parts[0].text;
    return JSON.parse(jsonString.replace(/```json|```/g, ''));

  } catch (error) {
    console.error('Error analyzing URL with Gemini:', error);
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
    const response = await fetch(config.BQ_API_ENDPOINT + 'upload_data', {
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