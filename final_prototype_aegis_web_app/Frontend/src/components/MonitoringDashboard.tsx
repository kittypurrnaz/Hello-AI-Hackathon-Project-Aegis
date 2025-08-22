




import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

import { Clock, Shield, Globe, Settings, User, AlertTriangle, Check, X, TrendingUp, Download, Calendar, BarChart3, PieChart, Activity, Flag, Brain, Zap, ExternalLink, ChevronRight, ChevronDown, FileText, RefreshCw, Search, Filter, Bot, MessageCircle, Send, Cpu, Timer, Eye, BookOpen, Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Area, AreaChart, Pie } from 'recharts';

// --- INTERFACES (No changes needed here) ---
interface BrowsingSession {
    id: string;
    website: string;
    domain: string;
    timeSpent: number; // Note: BQ data does not provide this, we'll use a placeholder.
    timestamp: Date;
    category: 'educational' | 'entertainment' | 'social' | 'gaming' | 'other';
    status: 'allowed' | 'blocked' | 'flagged';
}

// This interface is now specifically for the new Activity Log design
interface ActivityLogEntry {
    id: string;
    signal_type: string;
    flag_type: string;
    confidence: number;
    topic_category: string;
    source_platform: string;
    timestamp: Date;
    event_details: Record<string, any>;
}

interface TimeLimit {
    category: string;
    dailyLimit: number;
    currentUsage: number;
}

interface DailyUsage {
    date: string;
    screenTime: number; // Note: BQ data does not provide this, we'll estimate based on event count.
    sitesVisited: number;
    sitesBlocked: number;
    neutral: number;
    intermediate: number;
    immediate: number;
}

interface CategoryUsage {
    category: string;
    timeSpent: number; // Note: We'll use event count instead of time.
    percentage: number;
    color: string;
}

interface ThreatFlag {
    type: 'neutral' | 'intermediate' | 'immediate';
    count: number;
    description: string;
    color: string;
    bgColor: string;
    icon: any;
    // Details are now dynamically generated
    details: {
        urls: { url: string; description: string; timestamp: string; }[];
        summary: string;
        activities: { title: string; items: { url: string; description: string; timestamp: string; }[]; }[];
    };
}

// --- MAIN DASHBOARD COMPONENT ---
export function MonitoringDashboard() {
    // --- STATE MANAGEMENT ---
    // Data states - initialized as empty, to be filled by API calls
    const [activityLogData, setActivityLogData] = useState<ActivityLogEntry[]>([]);
    const [weeklyUsage, setWeeklyUsage] = useState<DailyUsage[]>([]);
    const [threatFlags, setThreatFlags] = useState<ThreatFlag[]>([]);
    const [aegisReport, setAegisReport] = useState<any>(null);

    // Child/User states
    const [childProfiles, setChildProfiles] = useState<{ id: string; name: string; age: number }[]>([]);
    const [activeChild, setActiveChild] = useState<string | null>(null);

    // UI/Control states
    const [monitoringEnabled, setMonitoringEnabled] = useState(true);
    const [selectedFlag, setSelectedFlag] = useState<ThreatFlag | null>(null);
    const [showFlagDetails, setShowFlagDetails] = useState(false);
    const [openActivities, setOpenActivities] = useState<Set<string>>(new Set());
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [generatedReport, setGeneratedReport] = useState<any>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [streamedReportContent, setStreamedReportContent] = useState<string | null>(null);
    const [isCustomDateRange, setIsCustomDateRange] = useState(false);


    // Loading and error states for data fetching
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states for Activity Log
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');




    // --- AGENT STATE (UPDATED) ---
    const [isAgentLoading, setIsAgentLoading] = useState(false);
    const [days, setDays] = useState(7);
    const [startDate, setStartDate] = useState('2025-08-01');
    const [endDate, setEndDate] = useState('2025-08-31');
    const [chatTone, setChatTone] = useState('Parental');
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<any>>([
        { id: '1', message: 'Hello! Ask me a question or request advice.', sender: 'agent', timestamp: new Date() }
    ]);

    // --- NEW: STATE FOR TIME PERIOD SELECTION ---
    const [timePeriod, setTimePeriod] = useState('7');

    // Base URL for your API
    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';
    const ADK_SERVER_URL = import.meta.env.VITE_ADK_URL;


    // --- NEW: DYNAMIC DATE CALCULATION BASED ON `timePeriod` ---
    const { startFormatted, endFormatted } = useMemo(() => {
        const today = new Date();
        const start = new Date(today);

        if (timePeriod === 'today') {
            start.setHours(0, 0, 0, 0);
        } else if (timePeriod === '7') {
            start.setDate(today.getDate() - 7);
        } else if (timePeriod === '30') {
            start.setDate(today.getDate() - 30);
        }

        const toISO = (date) => date.toISOString().split('T')[0];

        return {
            startFormatted: toISO(start),
            endFormatted: toISO(today),
        };
    }, [timePeriod]);

    

    // 1. Fetch the list of users (children) on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setError(null);
                setIsLoading(true);
                const response = await fetch(`${API_BASE_URL}/users`);
                if (!response.ok) throw new Error('Failed to fetch users.');

                const users = await response.json();

                if (users.length > 0) {
                    // Transform the BQ response to match the frontend's expected structure
                    const profiles = users.map((user, index) => ({
                        id: `${index + 1}`, // Create a simple ID
                        name: user.user_id,
                        age: 12 // Using a default age as it's not in BQ data
                    }));
                    setChildProfiles(profiles);
                    setActiveChild(profiles[0].name); // Set the first user as active
                } else {
                    setError("No users found in the database.");
                }
            } catch (err) {
                console.error(err);
                setError('Could not connect to the server to fetch user profiles.');
            } finally {
                // Loading will be set to false after the dashboard data is fetched
            }
        };
        fetchUsers();
    }, []);

    // 2. Fetch dashboard data when the active child or time period changes
    useEffect(() => {
        if (!activeChild) return;

        const fetchDataForChild = async () => {
            try {
                setError(null);
                setIsLoading(true);
                // --- MODIFIED: PASS start and end dates to API ---
                const response = await fetch(`${API_BASE_URL}/dashboard-data/${activeChild}?startDate=${startFormatted}&endDate=${endFormatted}`);
                if (!response.ok) throw new Error(`Failed to fetch data for ${activeChild}.`);

                const data = await response.json();

                // --- Process and transform the raw BigQuery data ---
                processBigQueryData(data);

            } catch (err) {
                console.error(err);
                setError(`Failed to load dashboard data. Please ensure the backend is running and can connect to BigQuery.`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataForChild();
    }, [activeChild, startFormatted, endFormatted]);

    



    // --- CORE ADK AGENT LOGIC ---
    const sendPrompt = async (promptText, onChunk) => {
        setIsAgentLoading(true);
        try {
            const response = await fetch(`${ADK_SERVER_URL}/run_sse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText }),
            });
            if (!response.ok || !response.body) throw new Error(`HTTP error! Status: ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                onChunk(chunk); // Call the callback with the new piece of text
            }
        } catch (error) {
            const errorMessage = `Error: ${error.message}. Please check the ADK server URL and CORS settings.`;
            onChunk(errorMessage);
            console.error(error);
        } finally {
            setIsAgentLoading(false);
        }
    };

    // --- AGENT AND REPORT HANDLERS (UPDATED TO USE TONE) ---
    const handleGetReport = () => {
        if (!activeChild) return;
        setIsReportModalOpen(true);
        setStreamedReportContent('');
        const prompt = `Generate a digital well-being report for child '${activeChild}' for the last ${days} days. Please use a helpful, ${chatTone} tone.`;
        sendPrompt(
            prompt,
            (chunk) => setStreamedReportContent((prev) => (prev || '') + chunk)
        );
    };

    const handleGetReportByTimeframe = () => {
        if (!activeChild) return;
        setIsReportModalOpen(true);
        setStreamedReportContent('');
        const prompt = `Generate a digital well-being report for child '${activeChild}' for the time period from ${startDate} to ${endDate}. Please use a helpful, ${chatTone} tone.`;
        sendPrompt(
            prompt,
            (chunk) => setStreamedReportContent((prev) => (prev || '') + chunk)
        );
    };

    const handleGetParentalAdvice = () => {
        if (!activeChild) return;
        const prompt = `Provide general parental advice for a child like '${activeChild}' regarding online safety, based on common risks. Please use a helpful, ${chatTone} tone.`;
        const agentMessageId = (Date.now() + 1).toString();
        const placeholderMessage = { id: agentMessageId, message: '', sender: 'agent', timestamp: new Date() };
        setChatHistory(prev => [...prev, placeholderMessage]);

        sendPrompt(prompt, (chunk) => {
            setChatHistory(prev => prev.map(msg =>
                msg.id === agentMessageId ? { ...msg, message: msg.message + chunk } : msg
            ));
        });
    };

    const handleChat = () => {
        if (!chatMessage.trim() || !activeChild) return;
        const userMessage = { id: Date.now().toString(), message: chatMessage, sender: 'user', timestamp: new Date() };
        const agentMessageId = (Date.now() + 1).toString();
        const placeholderMessage = { id: agentMessageId, message: '', sender: 'agent', timestamp: new Date() };

        setChatHistory(prev => [...prev, userMessage, placeholderMessage]);
        // Instruct the agent on its persona and tone before answering the user's query
        const prompt = `As an AI assistant for parents, respond to the following query using a helpful, ${chatTone} tone. Query: "${chatMessage}"`;
        setChatMessage('');

        sendPrompt(prompt, (chunk) => {
            setChatHistory(prev => prev.map(msg =>
                msg.id === agentMessageId ? { ...msg, message: msg.message + chunk } : msg
            ));
        });
    };

    const handleDownloadReport = () => {
        if (!streamedReportContent) return;
        const blob = new Blob([streamedReportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `Aegis-Report-${activeChild}-${date}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // 3. Helper function to process raw BQ data and update all derived states
    const processBigQueryData = (data) => {
        // --- 1. Filter the raw data based on the selected time period ---
        const now = new Date();
        const start = new Date(startFormatted);

        const filteredData = data.filter(entry => {
            const entryDate = new Date(entry.timestamp.value);
            return entryDate >= start && entryDate <= now;
        });

        // --- 2. Update all state variables based on filteredData ---

        // Update activity log data
        setActivityLogData(filteredData.map(row => ({
            id: row.timestamp?.value || Math.random().toString(),
            signal_type: row.signal_type,
            flag_type: row.flag_type,
            confidence: row.confidence,
            topic_category: row.topic_category,
            source_platform: row.source_platform,
            timestamp: row.timestamp ? new Date(row.timestamp.value) : new Date(),
            event_details: row.event_details,
        })));

        // Update threat flags
        const flags = {
            neutral: { count: 0, items: [] },
            intermediate: { count: 0, items: [] },
            immediate: { count: 0, items: [] }
        };

        filteredData.forEach(row => {
            const itemDetail = {
                url: row.source_platform || 'N/A',
                description: row.flag_type || 'General activity detected',
                timestamp: row.timestamp ? new Date(row.timestamp.value).toLocaleTimeString() : 'N/A'
            };

            if (row.signal_type?.includes('IMMEDIATE')) {
                flags.immediate.count++;
                flags.immediate.items.push(itemDetail);
            } else if (row.signal_type?.includes('INTERMEDIATE')) {
                flags.intermediate.count++;
                flags.intermediate.items.push(itemDetail);
            } else {
                flags.neutral.count++;
                flags.neutral.items.push(itemDetail);
            }
        });

        setThreatFlags([
            { type: 'neutral', count: flags.neutral.count, icon: Shield, color: '#16a34a', bgColor: '#dcfce7', description: 'Low risk activities', details: { urls: flags.neutral.items, summary: 'These are routine, safe activities.', activities: [{ title: 'Neutral Activities', items: flags.neutral.items }] } },
            { type: 'intermediate', count: flags.intermediate.count, icon: AlertTriangle, color: '#ea580c', bgColor: '#fed7aa', description: 'Moderate concerns', details: { urls: flags.intermediate.items, summary: 'These activities may require parental guidance.', activities: [{ title: 'Intermediate Concerns', items: flags.intermediate.items }] } },
            { type: 'immediate', count: flags.immediate.count, icon: Zap, color: '#dc2626', bgColor: '#fecaca', description: 'High priority issues', details: { urls: flags.immediate.items, summary: 'Urgent threats were detected and blocked.', activities: [{ title: 'Immediate Threats', items: flags.immediate.items }] } }
        ]);

        // Update weekly usage for the chart
        const usageByDay = {};
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        if (timePeriod === 'today') {
            const today = now.toLocaleDateString('en-US', { weekday: 'short' });
            usageByDay[today] = { date: today, screenTime: 0, sitesVisited: 0, neutral: 0, intermediate: 0, immediate: 0 };
        } else {
            daysOfWeek.forEach(day => {
                usageByDay[day] = { date: day, screenTime: 0, sitesVisited: 0, neutral: 0, intermediate: 0, immediate: 0 };
            });
        }
    
        filteredData.forEach(row => {
            const day = new Date(row.timestamp.value).toLocaleDateString('en-US', { weekday: 'short' });
            if (usageByDay[day]) {
                usageByDay[day].sitesVisited++;
                usageByDay[day].screenTime += 5;
                if (row.signal_type?.includes('IMMEDIATE')) usageByDay[day].immediate++;
                else if (row.signal_type?.includes('INTERMEDIATE')) usageByDay[day].intermediate++;
                else usageByDay[day].neutral++;
            }
        });
        setWeeklyUsage(Object.values(usageByDay));

        // Fetch AI-powered summary
        fetchAegisReport(filteredData);
    };


    // --- AI-POWERED SUMMARY ---
    const fetchAegisReport = async (activityData) => {
        if (activityData.length === 0) {
            setAegisReport({
                summary: "No activity data available to analyze for the selected user.",
                keyInsights: [],
                timestamp: "Generated just now"
            });
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/summarize-activity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activityData }) // Send the raw data
            });

            if (!response.ok) throw new Error('Failed to get summary from AI.');

            const result = await response.json();
            setAegisReport({
                summary: result.summary.actionable_advice.join(' '),
                keyInsights: result.summary.key_risks,
                timestamp: "Generated just now"
            });

        } catch (err) {
            console.error("Gemini summary error:", err);
            setAegisReport({
                summary: "Could not generate an AI summary at this time.",
                keyInsights: ["Please check the backend server and Gemini API configuration."],
                timestamp: "Error"
            });
        }
    };

    const highestRiskUsage = useMemo(() => {
    return weeklyUsage.map(day => {
        let riskCount = 0;
        let riskType = 'Neutral';
        if (day.immediate > 0) {
            riskCount = day.immediate;
            riskType = 'Immediate';
        } else if (day.intermediate > 0) {
            riskCount = day.intermediate;
            riskType = 'Intermediate';
        } else {
            riskCount = day.neutral;
            riskType = 'Neutral';
        }
        return {
            date: day.date,
            count: riskCount,
            type: riskType,
        };
    });
}, [weeklyUsage]);

    const filteredActivityLog = useMemo(() => {
        return activityLogData.filter((session) => {
            const lowerQuery = searchQuery.toLowerCase();
            return searchQuery === '' ||
                session.flag_type?.toLowerCase().includes(lowerQuery) ||
                session.topic_category?.toLowerCase().includes(lowerQuery) ||
                session.source_platform?.toLowerCase().includes(lowerQuery);
        });
    }, [activityLogData, searchQuery]);

    const concerningPlatforms = useMemo(() => {
        if (!activityLogData) return [];
        const threats = activityLogData.filter(log =>
            log.signal_type?.includes('IMMEDIATE') || log.signal_type?.includes('INTERMEDIATE')
        );
        const platformData = threats.reduce((acc, log) => {
            const platform = log.source_platform || 'Unknown Platform';
            if (!acc[platform]) {
                acc[platform] = { totalVisits: 0, flagCounts: {} };
            }
            acc[platform].totalVisits += 1;
            const flag = log.flag_type || 'Unspecified';
            acc[platform].flagCounts[flag] = (acc[platform].flagCounts[flag] || 0) + 1;
            return acc;
        }, {});
        const platformList = Object.entries(platformData).map(([platform, data]) => {
            const flagCounts = data.flagCounts;
            const topConcern = Object.keys(flagCounts).reduce((a, b) => flagCounts[a] > flagCounts[b] ? a : b, 'None');
            return { platform, topConcern, count: flagCounts[topConcern], totalVisits: data.totalVisits };
        });
        return platformList.sort((a, b) => b.totalVisits - a.totalVisits);
    }, [activityLogData]);

    const highestRiskStats = useMemo(() => {
        if (!activityLogData || activityLogData.length === 0) {
            return { specificRisk: 'None', confidence: 0, level: 'Neutral' };
        }
        let highestRiskLevel = 'Neutral';
        if (activityLogData.some(log => log.signal_type?.includes('IMMEDIATE'))) {
            highestRiskLevel = 'Immediate';
        } else if (activityLogData.some(log => log.signal_type?.includes('INTERMEDIATE'))) {
            highestRiskLevel = 'Intermediate';
        }
        if (highestRiskLevel === 'Neutral') {
            return { specificRisk: 'None', confidence: 0, level: 'Neutral' };
        }
        const highestRiskEvents = activityLogData.filter(log =>
            log.signal_type?.includes(highestRiskLevel.toUpperCase())
        );
        const flagCounts = highestRiskEvents.reduce((acc, log) => {
            const flag = log.flag_type || 'Unspecified';
            acc[flag] = (acc[flag] || 0) + 1;
            return acc;
        }, {});
        const topSpecificRisk = Object.keys(flagCounts).reduce((a, b) =>
            flagCounts[a] > flagCounts[b] ? a : b, 'None'
        );
        const eventsOfTopRisk = highestRiskEvents.filter(log => log.flag_type === topSpecificRisk);
        const totalConfidence = eventsOfTopRisk.reduce((acc, log) => acc + (log.confidence || 0), 0);
        return {
            specificRisk: topSpecificRisk,
            confidence: eventsOfTopRisk.length > 0 ? (totalConfidence / eventsOfTopRisk.length) * 100 : 0,
            level: highestRiskLevel,
        };
    }, [activityLogData]);

    const immediateThreats = threatFlags.find(flag => flag.type === 'immediate')?.count || 0;
    
    // Remaining code for other useMemo hooks and components can use `filteredData`

    const handleFlagClick = (flag) => {
        setSelectedFlag(flag);
        setShowFlagDetails(true);
        setOpenActivities(new Set());
    };

    const closeFlagDetails = () => {
        setShowFlagDetails(false);
        setSelectedFlag(null);
    };

    const toggleActivity = (activityTitle) => {
        const newOpenActivities = new Set(openActivities);
        if (newOpenActivities.has(activityTitle)) {
            newOpenActivities.delete(activityTitle);
        } else {
            newOpenActivities.add(activityTitle);
        }
        setOpenActivities(newOpenActivities);
    };


    const getSignalColorClass = (signal) => {
        if (signal?.includes('IMMEDIATE')) return 'border-red-500';
        if (signal?.includes('INTERMEDIATE')) return 'border-yellow-500';
        return 'border-gray-300';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading Dashboard Data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Card className="w-full max-w-lg border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle /> Error
                        </CardTitle>
                        <CardDescription>A problem occurred while loading the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                        <Button className="mt-4" onClick={() => window.location.reload()}>Try Again</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-background">
            {/* Immediate Threat Warning Banner */}
            {immediateThreats > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="max-w-7xl mx-auto flex items-center">
                        <div className="flex-shrink-0"><Zap className="h-5 w-5 text-red-400" /></div>
                        <div className="ml-3"><p className="text-sm text-red-700"><span className="font-medium">Security Alert!</span> {immediateThreats} immediate threat(s) detected.</p></div>
                        <div className="ml-auto pl-3">
                            <Button variant="ghost" size="sm" onClick={() => { const immediateFlag = threatFlags.find(flag => flag.type === 'immediate'); if (immediateFlag) handleFlagClick(immediateFlag); }} className="text-red-700 hover:bg-red-100">View Details</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="border-b bg-card">
                <div className="p-6 max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* SVG Logo is large, keeping it as is */}
                        <svg width="48" height="48" viewBox="0 0 48 48" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="shield-clip"><path d="M24 4L8 10v10c0 10 6.27 19.38 16 21 9.73-1.62 16-11 16-21V10L24 4z" /></clipPath></defs><polygon points="24,4 8,10 8,20 24,22 24,4" fill="#4285F4" clipPath="url(#shield-clip)" /><polygon points="24,4 40,10 40,20 24,22 24,4" fill="#EA4335" clipPath="url(#shield-clip)" /><polygon points="8,20 24,22 24,41 8,20" fill="#FBBC04" clipPath="url(#shield-clip)" /><polygon points="40,20 24,22 24,41 40,20" fill="#34A853" clipPath="url(#shield-clip)" /><path d="M24 4L8 10v10c0 10 6.27 19.38 16 21 9.73-1.62 16-11 16-21V10L24 4z" fill="none" stroke="#ffffff" strokeWidth="1.5" /><line x1="24" y1="4" x2="24" y2="41" stroke="rgba(255,255,255,0.4)" strokeWidth="1" clipPath="url(#shield-clip)" /><line x1="8" y1="20" x2="40" y2="20" stroke="rgba(255,255,255,0.4)" strokeWidth="1" clipPath="url(#shield-clip)" /><circle cx="24" cy="20" r="7" fill="rgba(255, 255, 255, 0.95)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1" /><path d="M20 20l2 2 4-4" stroke="#34A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                        <div>
                            <h1 className="text-3xl font-bold">Aegis</h1>
                            <p className="text-muted-foreground">Keep your children safe online with detailed insights</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="monitoring-toggle">Monitoring</Label>
                            <Switch id="monitoring-toggle" checked={monitoringEnabled} onCheckedChange={setMonitoringEnabled} />
                        </div>
                        <Badge variant={monitoringEnabled ? "default" : "secondary"}>{monitoringEnabled ? "Active" : "Paused"}</Badge>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Child Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Child Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            {activeChild && (
                                <>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                            {activeChild.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3>{activeChild}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Age {childProfiles.find(child => child.name === activeChild)?.age || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Select value={activeChild} onValueChange={setActiveChild}>
                                            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {childProfiles.map((child) => (
                                                    <SelectItem key={child.id} value={child.name}>{child.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {/* --- NEW: TIME PERIOD DROPDOWN --- */}
                                        <Select value={timePeriod} onValueChange={setTimePeriod}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Time Period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="today">Today</SelectItem>
                                                <SelectItem value="7">Last 7 Days</SelectItem>
                                                <SelectItem value="30">Last 30 Days</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {/* --- END NEW --- */}
                                    </div>
                                </>
                            )}
                        </div>
                        <br></br>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm">Total Events</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl">{activityLogData.length}</div>
                                    <p className="text-xs text-muted-foreground">in selected period</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm">Estimated Screen Time (Est.)</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl">{activityLogData.length * 5}m</div>
                                    <p className="text-xs text-muted-foreground">in selected period</p>
                                </CardContent>
                            </Card>

                            {/* NEW: Highest Risk Card */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm">Highest Risk Detected</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold truncate ${
                                        highestRiskStats.level === 'Immediate' ? 'text-destructive' :
                                            highestRiskStats.level === 'Intermediate' ? 'text-yellow-500' : ''
                                        }`}>
                                        {highestRiskStats.specificRisk.replace(/_/g, ' ')}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Avg. {highestRiskStats.confidence.toFixed(0)}% confidence
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Threat Flag Cards (no changes to these) */}
                            {threatFlags.map((flag, index) => {
                                const IconComponent = flag.icon;
                                return (
                                    <Card key={index} className="cursor-pointer transition-all hover:shadow-md hover:scale-105" onClick={() => handleFlagClick(flag)} style={{ borderColor: flag.color + '40', backgroundColor: flag.bgColor + '20' }}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm capitalize">{flag.type}</CardTitle>
                                            <IconComponent className="h-4 w-4" style={{ color: flag.color }} />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl" style={{ color: flag.color }}>{flag.count}</div>
                                            <p className="text-xs text-muted-foreground">{flag.description}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Inline Threat Flag Details Popup */}
                        {showFlagDetails && selectedFlag && (
                            <Card className="border-2" style={{ borderColor: selectedFlag.color + '40' }}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 capitalize">
                                            <selectedFlag.icon className="w-5 h-5" style={{ color: selectedFlag.color }} />
                                            {selectedFlag.type} Threat Level - {selectedFlag.count} Items
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" onClick={closeFlagDetails}><X className="w-4 h-4" /></Button>
                                    </div>
                                    <CardDescription>{selectedFlag.details.summary}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Details rendering logic remains the same */}
                                    {selectedFlag.details.activities.length > 0 && selectedFlag.details.activities[0].items.length > 0 ? (
                                        <div className="space-y-3">
                                            <h4 className="font-medium">Activity Categories:</h4>
                                            {selectedFlag.details.activities.map((activity, index) => (
                                                <Collapsible key={index}>
                                                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left hover:bg-muted/50 rounded-lg border" onClick={() => toggleActivity(activity.title)}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedFlag.color }}></div>
                                                            <span className="font-medium">{activity.title}</span>
                                                            <Badge variant="secondary">{activity.items.length}</Badge>
                                                        </div>
                                                        {openActivities.has(activity.title) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent className="px-3 pb-3">
                                                        <div className="space-y-3 mt-3">
                                                            {activity.items.map((item, itemIndex) => (
                                                                <div key={itemIndex} className="p-3 border rounded-lg bg-muted/20 ml-4">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                                                                <code className="text-sm bg-muted px-2 py-1 rounded">{item.url}</code>
                                                                            </div>
                                                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                                                        </div>
                                                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{item.timestamp}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No '{selectedFlag.type}' threats detected for this user.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                    </CardContent>
                </Card>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                        <TabsTrigger value="history">Activity Log</TabsTrigger>
                        <TabsTrigger value="agents">Agents</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        {/* Updated stats grid with 6 cards */}


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* <Card>
                                <CardHeader>
                                    <CardTitle>Weekly Activity Events</CardTitle>
                                    <CardDescription>Event counts over the past week</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={weeklyUsage}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="sitesVisited" fill="#3b82f6" name="Total Events" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card> */}
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        Weekly Threat Trends
                                    </CardTitle>
                                    <CardDescription>Daily threat level detection over the past week</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={weeklyUsage}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="neutral" stackId="a" fill="#16a34a" name="Neutral" />
                                            <Bar dataKey="intermediate" stackId="a" fill="#eab308" name="Intermediate" />
                                            <Bar dataKey="immediate" stackId="a" fill="#dc2626" name="Immediate" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Aegis Says Section  change to recieve from adk*/}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-primary" />Parental Advice</CardTitle>
                                    <CardDescription>Aegis-powered insights and advice</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {aegisReport ? (
                                        <>
                                            <div className="text-sm leading-relaxed text-foreground">{aegisReport.summary}</div>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium">Key Insights:</h4>
                                                <ul className="space-y-1">
                                                    {aegisReport.keyInsights.map((insight, index) => (
                                                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                                                            <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>{insight}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="pt-2 border-t"><p className="text-xs text-muted-foreground italic">{aegisReport.timestamp}</p></div>
                                        </>
                                    ) : <p>Generating AI summary...</p>}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Reports Tab */}
                    <TabsContent value="reports" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        Weekly Threat Trends
                                    </CardTitle>
                                    <CardDescription>Daily threat level detection over the past week</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={weeklyUsage}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="neutral" stackId="a" fill="#16a34a" name="Neutral" />
                                            <Bar dataKey="intermediate" stackId="a" fill="#eab308" name="Intermediate" />
                                            <Bar dataKey="immediate" stackId="a" fill="#dc2626" name="Immediate" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card> */}
                            <Card>
    <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Highest Threat Trends ({highestRiskStats.specificRisk.replace(/_/g, ' ')})
        </CardTitle>
        <CardDescription>Daily count of the highest threat level detected.</CardDescription>
    </CardHeader>
    <CardContent>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={highestRiskUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="count"
                    name="Highest Risk Events"
                    stroke="#dc2626"
                    strokeWidth={2}
                />
            </LineChart>
        </ResponsiveContainer>
    </CardContent>
</Card>
              
                            {/* Concerning Activities Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Concerning Activities by Platform</CardTitle>
                                    <CardDescription>Top flagged activities on the most visited platforms.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {concerningPlatforms.length > 0 ? (
                                        concerningPlatforms.slice(0, 5).map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-destructive text-destructive-foreground rounded-md flex items-center justify-center w-8 h-8 font-bold">
                                                        {item.totalVisits}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.platform}</p>
                                                        <p className="text-sm text-destructive font-semibold">
                                                            {item.topConcern.replace(/_/g, ' ')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{item.count} flags</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        out of {item.totalVisits} visits
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted-foreground p-4">
                                            No concerning activities found.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Report Generation card */}
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={isCustomDateRange}
                                            onCheckedChange={setIsCustomDateRange}
                                            className="data-[state=checked]:bg-primary shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        />
                                        <Label htmlFor="custom-date-toggle">Custom Date Range</Label>
                                    </div>
                                    {/* Dynamically changing button */}
                                    <Button
                                        onClick={isCustomDateRange ? handleGetReportByTimeframe : handleGetReport}
                                        disabled={isAgentLoading}
                                    >
                                        {isAgentLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                        Generate {isCustomDateRange ? 'Custom' : days}-Day Report
                                    </Button>
                                </div>

                                {isCustomDateRange && (
                                    <div className="flex gap-2">
                                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                    </div>
                                )}

                                <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                                    <DialogContent className="sm:max-w-[625px]">
                                        <DialogHeader>
                                            <DialogTitle>Generated Digital Well-being Report</DialogTitle>
                                            <DialogDescription>
                                                This report for "{activeChild}" is being generated in a {chatTone} tone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                                            {isAgentLoading && !streamedReportContent && (
                                                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Connecting...</div>
                                            )}
                                            <pre className="text-sm whitespace-pre-wrap font-sans">{streamedReportContent}</pre>
                                        </ScrollArea>
                                        <DialogFooter>
                                            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                                            <Button onClick={handleDownloadReport} disabled={isAgentLoading || !streamedReportContent}><Download className="w-4 h-4 mr-2" />Download</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </div>
                        {/* Generated report display - no changes to its logic */}
                        {(isGeneratingReport || streamedReportContent) && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Generated Digital Well-being Report
                                    </CardTitle>
                                    <CardDescription>
                                        This report was generated in real-time by the Aegis Agent.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isGeneratingReport && !streamedReportContent && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating report, please wait...
                                        </div>
                                    )}
                                    <pre className="text-sm whitespace-pre-wrap font-sans">
                                        {streamedReportContent}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>


                    {/* Activity Log Tab */}
                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Activity Log</CardTitle>
                                <CardDescription>A detailed timeline of all recorded events and potential risks.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Simplified filter controls to just a search bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by flag, topic, or platform..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <ScrollArea className="h-[600px] w-full pr-4">
                                    <div className="space-y-4">
                                        {filteredActivityLog.length > 0 ? (
                                            filteredActivityLog.map((session) => {
                                                const confidencePercent = session.confidence ? (session.confidence * 100).toFixed(0) : 'N/A';

                                                return (
                                                    <div key={session.id} className="rounded-lg overflow-hidden border bg-card">
                                                        {/* Top Section */}
                                                        <div className={`w-full flex justify-between items-start p-4 ${getSignalColorClass(session.signal_type)}`} style={{ borderLeftWidth: '4px' }}>
                                                            <div className="flex-grow pr-4">
                                                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                                                    <Badge variant="destructive" className="font-semibold">{session.flag_type?.replace(/_/g, ' ') || 'UNCATEGORIZED'}</Badge>
                                                                    <p className="text-sm font-medium text-muted-foreground">{session.topic_category || 'General Topic'}</p>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    On <span className="font-medium text-foreground">{session.source_platform || 'Unknown'}</span> at
                                                                    <span className="font-medium text-foreground"> {session.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </p>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <p className="text-xl font-bold text-primary">{confidencePercent}%</p>
                                                                <p className="text-xs text-muted-foreground">Confidence</p>
                                                            </div>
                                                        </div>
                                                        {/* Bottom "Reasoning" Section */}
                                                        {session.event_details && (
                                                            <div className="w-full bg-muted/50 p-4 border-t">
                                                                <p className="text-xs font-semibold mb-2 text-muted-foreground">REASONING:</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {Object.entries(session.event_details).map(([key, value]) => {
                                                                        if (!value) return null; // Don't render if value is null/empty
                                                                        const cleanedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                                        return <Badge key={key} variant="secondary">{cleanedKey}</Badge>;
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>No activities found matching your criteria.</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Agents Tab */}
                    <TabsContent value="agents" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                            <Card className="lg:col-span-2">
    <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />Chat with Aegis Agent
        </CardTitle>
        <CardDescription>Your conversation is in a <span className="font-semibold text-primary">{chatTone}</span> tone.</CardDescription>
    </CardHeader>
    <CardContent className="flex items-center justify-center h-96">
        <div className="text-center text-muted-foreground p-8">
            <Cpu className="w-12 h-12 mx-auto mb-4" />
            <h4 className="text-xl font-semibold">AI Chat Coming Soon</h4>
            <p className="mt-2">Our AI assistant is currently being trained to provide real-time, personalized advice. Please check back later!</p>
        </div>
    </CardContent>
</Card>
                            <Card className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5 text-primary" />Agent Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="chat-tone">Set Conversation Tone</Label>
                                        <Select value={chatTone} onValueChange={setChatTone}>
                                            <SelectTrigger id="chat-tone"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Parental">Parental</SelectItem>
                                                <SelectItem value="Analytical">Analytical</SelectItem>
                                                <SelectItem value="Supportive">Supportive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleGetParentalAdvice} disabled={isAgentLoading} className="w-full">
                                        {isAgentLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
                                        Get General Advice
                                    </Button>
                                </CardContent>
                            </Card>

                            
                        </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Child Profiles</CardTitle>
                                <CardDescription>Manage existing child monitoring profiles fetched from the database.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        Profile management (Add, Edit, Delete) is currently disabled as profiles are loaded directly from your BigQuery data source. To manage users, you would need to update your data source and corresponding backend endpoints.
                                    </AlertDescription>
                                </Alert>
                                <div className="space-y-4 mt-4">
                                    {childProfiles.map((child) => (
                                        <div key={child.id} className={`p-4 rounded-lg border-2 ${activeChild === child.name ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground">{child.name.charAt(0).toUpperCase()}</div>
                                                    <div>
                                                        <h4 className="font-medium">{child.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{child.age} years old</p>
                                                    </div>
                                                </div>
                                                {activeChild === child.name && <Badge variant="default">Currently Active</Badge>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                   
                </Tabs>
            </div>
        </div>
    );
}