// config.js

export const config = {
  // --- DEVELOPER TOGGLE ---
  // true: Saves all analysis results to chrome.storage.local
  // false: Sends all analysis results to the frontend API
  STORE_LOCALLY: true,

  // --- API ENDPOINTS & KEYS ---
  FRONTEND_API_ENDPOINT: 'https://your-frontend-api.com/api/report',
  
  // Replace with your actual Gemini API key
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY',
  
  // The specific Gemini model endpoint you are using
  GEMINI_API_ENDPOINT: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent`,

  // --- ANALYSIS THRESHOLDS ---
  // Value from 0 to 1. If any toxicity label score is above this, it's flagged.
  TOXICITY_THRESHOLD: 0.7,
  
  // Number of recent history items to analyze
  HISTORY_ANALYSIS_COUNT: 50
};