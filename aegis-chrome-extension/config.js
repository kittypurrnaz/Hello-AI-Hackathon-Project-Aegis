// config.js

export const config = {
  // --- DEVELOPER TOGGLE ---
  // true: Saves all analysis results to chrome.storage.local
  // false: Sends all analysis results to the frontend API
  STORE_LOCALLY: true,

  // --- API ENDPOINTS & KEYS ---
  BQ_API_ENDPOINT: 'https://aegis-ingestion-api-943089436637.us-central1.run.app/',
  
  // Replace with your actual Gemini API key
  GEMINI_API_KEY: 'YOUR_API_KEY_HERE',
  GEMINI_API_LOCATION: 'us-central1',
  GEMINI_API_MODEL: 'gemini-2.5-flash', // The specific Gemini model you are using
  GEMINI_PROJECT_ID: 'trainee-project-tianyi', // Replace with your actual project ID
  
  // --- ANALYSIS THRESHOLDS ---
  // Value from 0 to 1. If any toxicity label score is above this, it's flagged.
  TOXICITY_THRESHOLD: 0.7,
  
  // Number of recent history items to analyze
  HISTORY_ANALYSIS_COUNT: 50,

   // The endpoint for your database
  INTERMEDIATE_STORAGE_ENDPOINT: 'https://your-database-api.com/api/store-report',
  
  // Keywords to determine severity
  IMMEDIATE_CATEGORIES: ['identity_attack', 'severe_toxicity', 'suicide', 'gore', 'drugs'], // Added common toxicity labels
  INTERMEDIATE_CATEGORIES: ['nsfw', 'smut', 'toxicity', 'insult', 'racial insults', 'sexual'] // Added common toxicity labels
};