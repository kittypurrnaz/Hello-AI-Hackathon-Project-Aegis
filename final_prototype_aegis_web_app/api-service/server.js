

// Import necessary libraries
const express = require('express');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');
const fetch = require('node-fetch');

// Initialize Express app and BigQuery client
const app = express();
const bigquery = new BigQuery();

app.use(cors());
app.use(express.json());

// --- ENDPOINT TO GET UNIQUE USERS (No change) ---
app.get('/api/users', async (req, res) => {
    console.log('Fetching list of unique users.');
    const query = `
      SELECT DISTINCT user_id
      FROM \`trainee-project-tianyi.aegis_dataset.user_activity_analysis\`
      WHERE user_id IS NOT NULL
      ORDER BY user_id ASC
    `;
    const options = { query: query, location: 'US' };
    try {
        const [rows] = await bigquery.query(options);
        console.log(`Successfully fetched ${rows.length} unique users.`);
        res.status(200).json(rows);
    } catch (error) {
        console.error('BIGQUERY ERROR fetching users:', error);
        res.status(500).send({ message: 'Error fetching user list from BigQuery', error: error.message });
    }
});

// --- NEW ENDPOINT FOR AGGREGATED DASHBOARD METRICS ---
app.get('/api/dashboard-metrics/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { startDate, endDate } = req.query;

    if (!userId) {
        return res.status(400).send({ message: 'User ID is required.' });
    }

    console.log(`Fetching aggregated data for user: ${userId} with date range ${startDate} to ${endDate}.`);

    let query = `
        SELECT
            COUNT(*) AS total_events,
            SUM(CASE WHEN signal_type LIKE '%NEUTRAL%' THEN 1 ELSE 0 END) AS neutral_flags,
            SUM(CASE WHEN signal_type LIKE '%INTERMEDIATE%' THEN 1 ELSE 0 END) AS intermediate_flags,
            SUM(CASE WHEN signal_type LIKE '%IMMEDIATE%' THEN 1 ELSE 0 END) AS immediate_flags
        FROM \`trainee-project-tianyi.aegis_dataset.user_activity_analysis\`
        WHERE user_id = @userId
    `;

    const options = {
        location: 'US',
        params: { userId: userId },
    };

    var duration = endDate - startDate; 

    if (startDate && endDate) {
        query += ` AND DATE(timestamp) BETWEEN DATE_SUB(@endDate, INTERVAL @duration DAY) AND @endDate()`;
        options.params.startDate = startDate;
        options.params.endDate = endDate;
    }

    try {
        const [job] = await bigquery.createQueryJob({ query, ...options });
        const [rows] = await job.getQueryResults();
        
        const processedData = rows[0] || {
            total_events: 0,
            neutral_flags: 0,
            intermediate_flags: 0,
            immediate_flags: 0,
        };

        console.log('--- Server Aggregated Data Log ---');
        console.log('Processed Data for Frontend:', processedData);
        console.log('----------------------------------');

        res.status(200).json(processedData);

    } catch (error) {
        console.error('BIGQUERY ERROR fetching dashboard data:', error);
        res.status(500).send({ message: 'Error fetching data from BigQuery', error: error.message });
    }
});

// --- NEW ENDPOINT FOR RAW ACTIVITY LOG DATA ---
app.get('/api/activity-log/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { startDate, endDate } = req.query;

    if (!userId) {
        return res.status(400).send({ message: 'User ID is required.' });
    }
    
    console.log(`Fetching raw activity log for user: ${userId} with date range ${startDate} to ${endDate}.`);

    let query = `
        SELECT
            timestamp,
            signal_type,
            flag_type,
            confidence,
            topic_category,
            source_platform,
            event_details
        FROM \`trainee-project-tianyi.aegis_dataset.user_activity_analysis\`
        WHERE user_id = @userId
    `;

    const options = {
        location: 'US',
        params: { userId: userId },
    };

    if (startDate && endDate) {
        query += ` AND DATE(timestamp) BETWEEN DATE(@startDate) AND DATE(@endDate)`;
        options.params.startDate = startDate;
        options.params.endDate = endDate;
    }
    
    query += ` ORDER BY timestamp DESC`;

    try {
        const [job] = await bigquery.createQueryJob({ query, ...options });
        const [rows] = await job.getQueryResults();

        console.log(`--- Server Raw Data Log ---`);
        console.log(`Total rows fetched for Activity Log: ${rows.length}`);
        if (rows.length > 0) {
            console.log('Sample of fetched data (first row):', JSON.stringify(rows[0], null, 2));
        }
        console.log('---------------------------');

        res.status(200).json(rows);
    } catch (error) {
        console.error('BIGQUERY ERROR fetching activity log:', error);
        res.status(500).send({ message: 'Error fetching activity log from BigQuery', error: error.message });
    }
});


// --- GEMINI FEATURE (No change) ---
app.post('/api/summarize-activity', async (req, res) => {
    const { activityData } = req.body;
    if (!activityData || activityData.length === 0) {
        return res.status(400).json({ error: 'Activity data is required.' });
    }
    const activityText = activityData.map(item =>
        `- Event: ${item.flag_type} on ${item.source_platform} (Confidence: ${(item.confidence * 100).toFixed(0)}%). Reason: ${Object.keys(item.event_details || {}).join(', ')}`
    ).join('\n');
    const prompt = `Analyze the following child's online activity log. Respond with a JSON object containing three keys: "summary_title" (a short, engaging title), "key_risks" (an array of 2-3 strings describing the main risks), and "actionable_advice" (an array of 1-2 strings with supportive, constructive advice for a parent).
Activity Log:
${activityText}`;
    try {
        const apiKey = "PASTE_YOUR_API_KEY_HERE";
        if (apiKey === "PASTE_YOUR_API_KEY_HERE") {
            throw new Error("API key not set. Please add your Gemini API key for local testing.");
        }
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        };
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`Gemini API failed with status: ${apiResponse.status}, message: ${errorText}`);
        }
        const result = await apiResponse.json();
        const summaryJson = JSON.parse(result.candidates[0].content.parts[0].text);
        res.status(200).json({ summary: summaryJson });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: `Failed to generate summary. ${error.message}` });
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`API Server listening on port ${PORT}`);
});