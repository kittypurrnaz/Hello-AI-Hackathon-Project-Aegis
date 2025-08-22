import { useState, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

import { Clock, Shield, Globe, Settings, User, AlertTriangle, Check, X, TrendingUp, Download, Calendar, BarChart3, PieChart, Activity, Flag, Brain, Zap, ExternalLink, ChevronRight, ChevronDown, FileText, RefreshCw, Search, Filter, Bot, MessageCircle, Send, Cpu, Timer, Eye, BookOpen, Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Area, AreaChart, Pie } from 'recharts';

interface BrowsingSession {
  id: string;
  website: string;
  domain: string;
  timeSpent: number;
  timestamp: Date;
  category: 'educational' | 'entertainment' | 'social' | 'gaming' | 'other';
  status: 'allowed' | 'blocked' | 'flagged';
}

interface TimeLimit {
  category: string;
  dailyLimit: number;
  currentUsage: number;
}

interface DailyUsage {
  date: string;
  screenTime: number;
  sitesVisited: number;
  sitesBlocked: number;
  neutral: number;
  intermediate: number;
  immediate: number;
}

interface CategoryUsage {
  category: string;
  timeSpent: number;
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
  details: {
    urls: { url: string; description: string; timestamp: string; }[];
    summary: string;
    activities: { title: string; items: { url: string; description: string; timestamp: string; }[]; }[];
  };
}

export function MonitoringDashboard() {
  const [activeChild, setActiveChild] = useState('Emma');
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedFlag, setSelectedFlag] = useState<ThreatFlag | null>(null);
  const [showFlagDetails, setShowFlagDetails] = useState(false);
  const [openActivities, setOpenActivities] = useState<Set<string>>(new Set());
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  
  // Filter states for Activity Log
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Agents states
  const [selectedAgent, setSelectedAgent] = useState<string>('analysis');
  const [chatMessage, setChatMessage] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    message: string;
    sender: 'user' | 'agent';
    timestamp: Date;
    agentName?: string;
  }>>([
    {
      id: '1',
      message: 'Hello! I\'m your Analysis Agent. I analyze Emma\'s browsing patterns and provide detailed insights about her digital behavior. Ask me about usage trends, threat analysis, or any data-related questions.',
      sender: 'agent',
      timestamp: new Date(),
      agentName: 'Analysis Agent'
    }
  ]);
  
  // Child profiles state
  const [childProfiles, setChildProfiles] = useState([
    { id: '1', name: 'Emma Johnson', age: 12 },
    { id: '2', name: 'Alex Johnson', age: 8 },
    { id: '3', name: 'Sophie Johnson', age: 15 }
  ]);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [editingChild, setEditingChild] = useState<{id: string, name: string, age: number} | null>(null);
  
  // Mock data with more entries for better filtering demonstration
  const browsingHistory: BrowsingSession[] = [
    {
      id: '1',
      website: 'Khan Academy Math',
      domain: 'khanacademy.org',
      timeSpent: 45,
      timestamp: new Date('2025-08-19T10:30:00'),
      category: 'educational',
      status: 'allowed'
    },
    {
      id: '2',
      website: 'YouTube Kids',
      domain: 'youtube.com',
      timeSpent: 25,
      timestamp: new Date('2025-08-19T11:15:00'),
      category: 'entertainment',
      status: 'allowed'
    },
    {
      id: '3',
      website: 'Inappropriate Site',
      domain: 'blocked-site.com',
      timeSpent: 0,
      timestamp: new Date('2025-08-19T12:00:00'),
      category: 'other',
      status: 'blocked'
    },
    {
      id: '4',
      website: 'National Geographic Kids',
      domain: 'kids.nationalgeographic.com',
      timeSpent: 30,
      timestamp: new Date('2025-08-19T13:30:00'),
      category: 'educational',
      status: 'allowed'
    },
    {
      id: '5',
      website: 'Scratch Programming',
      domain: 'scratch.mit.edu',
      timeSpent: 50,
      timestamp: new Date('2025-08-19T14:15:00'),
      category: 'educational',
      status: 'allowed'
    },
    {
      id: '6',
      website: 'Minecraft Official',
      domain: 'minecraft.net',
      timeSpent: 35,
      timestamp: new Date('2025-08-19T15:00:00'),
      category: 'gaming',
      status: 'allowed'
    },
    {
      id: '7',
      website: 'Discord',
      domain: 'discord.com',
      timeSpent: 0,
      timestamp: new Date('2025-08-19T15:30:00'),
      category: 'social',
      status: 'blocked'
    },
    {
      id: '8',
      website: 'PBS Kids Games',
      domain: 'pbskids.org',
      timeSpent: 20,
      timestamp: new Date('2025-08-19T16:00:00'),
      category: 'entertainment',
      status: 'allowed'
    },
    {
      id: '9',
      website: 'Suspicious Gaming Site',
      domain: 'sus-games.net',
      timeSpent: 0,
      timestamp: new Date('2025-08-19T16:30:00'),
      category: 'gaming',
      status: 'flagged'
    },
    {
      id: '10',
      website: 'Khan Academy Science',
      domain: 'khanacademy.org',
      timeSpent: 40,
      timestamp: new Date('2025-08-19T17:00:00'),
      category: 'educational',
      status: 'allowed'
    }
  ];

  // Filtered browsing history based on search and filters
  const filteredBrowsingHistory = useMemo(() => {
    return browsingHistory.filter((session) => {
      // Search filter - check website name, domain, and category
      const matchesSearch = searchQuery === '' || 
        session.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;

      // Category filter
      const matchesCategory = categoryFilter === 'all' || session.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [browsingHistory, searchQuery, statusFilter, categoryFilter]);

  const timeLimits: TimeLimit[] = [
    { category: 'Educational', dailyLimit: 120, currentUsage: 125 },
    { category: 'Entertainment', dailyLimit: 60, currentUsage: 25 },
    { category: 'Social Media', dailyLimit: 30, currentUsage: 0 },
    { category: 'Gaming', dailyLimit: 45, currentUsage: 0 }
  ];

  // Updated weekly usage data with threat levels
  const weeklyUsage: DailyUsage[] = [
    { date: 'Mon', screenTime: 145, sitesVisited: 8, sitesBlocked: 2, neutral: 6, intermediate: 2, immediate: 0 },
    { date: 'Tue', screenTime: 120, sitesVisited: 12, sitesBlocked: 1, neutral: 10, intermediate: 1, immediate: 1 },
    { date: 'Wed', screenTime: 180, sitesVisited: 15, sitesBlocked: 3, neutral: 12, intermediate: 2, immediate: 1 },
    { date: 'Thu', screenTime: 95, sitesVisited: 6, sitesBlocked: 1, neutral: 5, intermediate: 1, immediate: 0 },
    { date: 'Fri', screenTime: 160, sitesVisited: 14, sitesBlocked: 2, neutral: 11, intermediate: 2, immediate: 1 },
    { date: 'Sat', screenTime: 220, sitesVisited: 18, sitesBlocked: 4, neutral: 14, intermediate: 3, immediate: 1 },
    { date: 'Sun', screenTime: 135, sitesVisited: 10, sitesBlocked: 1, neutral: 8, intermediate: 2, immediate: 0 }
  ];

  const categoryUsage: CategoryUsage[] = [
    { category: 'Educational', timeSpent: 125, percentage: 58, color: '#22c55e' },
    { category: 'Entertainment', timeSpent: 65, percentage: 30, color: '#3b82f6' },
    { category: 'Gaming', timeSpent: 20, percentage: 9, color: '#f59e0b' },
    { category: 'Other', timeSpent: 5, percentage: 3, color: '#6b7280' }
  ];

  // New threat flags data with detailed information and activities
  const threatFlags: ThreatFlag[] = [
    {
      type: 'neutral',
      count: 8,
      description: 'Low risk activities',
      color: '#16a34a',
      bgColor: '#dcfce7',
      icon: Shield,
      details: {
        summary: 'These activities are considered safe and appropriate for Emma\'s age group. No immediate action required.',
        urls: [
          {
            url: 'khanacademy.org/math',
            description: 'Educational math content - algebra and geometry lessons',
            timestamp: '2:30 PM'
          },
          {
            url: 'scratch.mit.edu/projects',
            description: 'Programming tutorials and coding exercises',
            timestamp: '1:45 PM'
          },
          {
            url: 'kids.nationalgeographic.com/animals',
            description: 'Educational content about wildlife and nature',
            timestamp: '12:15 PM'
          },
          {
            url: 'pbskids.org/games',
            description: 'Age-appropriate educational games and activities',
            timestamp: '11:30 AM'
          },
          {
            url: 'coolmath4kids.com',
            description: 'Mathematical games and puzzles for children',
            timestamp: '10:45 AM'
          }
        ],
        activities: [
          {
            title: 'Educational Content Access',
            items: [
              {
                url: 'khanacademy.org/math',
                description: 'Educational math content - algebra and geometry lessons',
                timestamp: '2:30 PM'
              },
              {
                url: 'scratch.mit.edu/projects',
                description: 'Programming tutorials and coding exercises',
                timestamp: '1:45 PM'
              },
              {
                url: 'kids.nationalgeographic.com/animals',
                description: 'Educational content about wildlife and nature',
                timestamp: '12:15 PM'
              }
            ]
          },
          {
            title: 'Learning Games & Activities',
            items: [
              {
                url: 'pbskids.org/games',
                description: 'Age-appropriate educational games and activities',
                timestamp: '11:30 AM'
              },
              {
                url: 'coolmath4kids.com',
                description: 'Mathematical games and puzzles for children',
                timestamp: '10:45 AM'
              }
            ]
          }
        ]
      }
    },
    {
      type: 'intermediate',
      count: 2,
      description: 'Moderate concerns detected',
      color: '#ea580c',
      bgColor: '#fed7aa',
      icon: AlertTriangle,
      details: {
        summary: 'These sites may contain content that requires parental guidance or monitoring. Consider reviewing with Emma.',
        urls: [
          {
            url: 'youtube.com/watch',
            description: 'Video content that may contain mature themes or advertisements',
            timestamp: '3:15 PM'
          },
          {
            url: 'reddit.com/r/teenagers',
            description: 'Social platform with user-generated content, potential exposure to inappropriate discussions',
            timestamp: '2:00 PM'
          }
        ],
        activities: [
          {
            title: 'Questionable Video Content',
            items: [
              {
                url: 'youtube.com/watch',
                description: 'Video content that may contain mature themes or advertisements',
                timestamp: '3:15 PM'
              }
            ]
          },
          {
            title: 'Social Media Attempts',
            items: [
              {
                url: 'reddit.com/r/teenagers',
                description: 'Social platform with user-generated content, potential exposure to inappropriate discussions',
                timestamp: '2:00 PM'
              }
            ]
          }
        ]
      }
    },
    {
      type: 'immediate',
      count: 3,
      description: 'High priority issues',
      color: '#dc2626',
      bgColor: '#fecaca',
      icon: Zap,
      details: {
        summary: 'These are serious security or safety threats that require immediate parent attention and action.',
        urls: [
          {
            url: 'suspicious-download-site.com',
            description: 'Attempted download of suspicious executable file',
            timestamp: '4:20 PM'
          },
          {
            url: 'inappropriate-chat.net',
            description: 'Access attempt to adult chat platform',
            timestamp: '3:45 PM'
          },
          {
            url: 'malware-host.org',
            description: 'Blocked malicious website with known security threats',
            timestamp: '1:30 PM'
          }
        ],
        activities: [
          {
            title: 'Malicious Downloads',
            items: [
              {
                url: 'suspicious-download-site.com',
                description: 'Attempted download of suspicious executable file',
                timestamp: '4:20 PM'
              },
              {
                url: 'malware-host.org',
                description: 'Blocked malicious website with known security threats',
                timestamp: '1:30 PM'
              }
            ]
          },
          {
            title: 'Inappropriate Content Access',
            items: [
              {
                url: 'inappropriate-chat.net',
                description: 'Access attempt to adult chat platform',
                timestamp: '3:45 PM'
              }
            ]
          }
        ]
      }
    }
  ];

  // AI-generated report summary
  const aegisReport = {
    summary: "Based on Emma's browsing patterns today, she has shown excellent focus on educational content, spending 58% of her time on learning platforms. However, there are 3 immediate security threats that require your attention, including attempted access to inappropriate content and potential malware. Overall safety score: 65/100. Please review the immediate alerts and consider having a conversation about online safety.",
    keyInsights: [
      "Strong educational engagement with Khan Academy and programming sites",
      "3 immediate security threats detected - requires immediate attention",
      "Attempted access to inappropriate adult content blocked successfully"
    ],
    timestamp: "Generated 2 minutes ago"
  };

  // Get count of immediate threats for warning banner
  const immediateThreats = threatFlags.find(flag => flag.type === 'immediate')?.count || 0;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'educational': return 'bg-green-100 text-green-800';
      case 'entertainment': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      case 'gaming': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'allowed': return <Check className="w-4 h-4 text-green-600" />;
      case 'blocked': return <X className="w-4 h-4 text-red-600" />;
      case 'flagged': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const generateReport = () => {
    // This would generate and download a PDF report
    console.log('Generating report...');
    alert('Report generation feature would download a PDF summary here');
  };

  const generateDetailedReport = async () => {
    setIsGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
      
      // Generate mock report data
      const report = {
        generatedAt: new Date(),
        child: activeChild,
        period: 'August 13 - August 20, 2025',
        summary: {
          totalScreenTime: '25h 30m',
          sitesVisited: 94,
          sitesBlocked: 13,
          threatFlags: {
            neutral: 8,
            intermediate: 2,
            immediate: 3
          },
          safetyScore: 65
        },
        topActivities: [
          { category: 'Educational', timeSpent: '14h 45m', percentage: 58 },
          { category: 'Entertainment', timeSpent: '7h 40m', percentage: 30 },
          { category: 'Gaming', timeSpent: '2h 20m', percentage: 9 },
          { category: 'Other', timeSpent: '45m', percentage: 3 }
        ],
        keyInsights: [
          'Strong educational engagement with Khan Academy and programming sites',
          '3 immediate security threats detected and blocked successfully',
          'Screen time increased 15% compared to previous week',
          'Most active browsing periods: 2:00-4:00 PM and 7:00-9:00 PM'
        ],
        recommendations: [
          'Consider discussing online safety with Emma due to blocked inappropriate content attempts',
          'Encourage more breaks during extended educational sessions',
          'Review and update content filters based on recent threat patterns'
        ]
      };
      
      setGeneratedReport(report);
    }, 2000);
  };

  const handleFlagClick = (flag: ThreatFlag) => {
    setSelectedFlag(flag);
    setShowFlagDetails(true);
    setOpenActivities(new Set()); // Reset open activities
  };

  const closeFlagDetails = () => {
    setShowFlagDetails(false);
    setSelectedFlag(null);
  };

  const toggleActivity = (activityTitle: string) => {
    const newOpenActivities = new Set(openActivities);
    if (newOpenActivities.has(activityTitle)) {
      newOpenActivities.delete(activityTitle);
    } else {
      newOpenActivities.add(activityTitle);
    }
    setOpenActivities(newOpenActivities);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  // Agents data
  const agents = [
    {
      id: 'analysis',
      name: 'Analysis Agent',
      description: 'Analyzes browsing patterns and provides detailed insights',
      icon: BarChart3,
      color: '#2563eb',
      bgColor: '#eff6ff',
      status: 'active',
      capabilities: ['Data Analysis', 'Threat Detection', 'Usage Patterns', 'Risk Assessment', 'Behavioral Insights', 'Trend Analysis']
    },
    {
      id: 'advice',
      name: 'Parental Advice Agent',
      description: 'Provides parenting guidance and recommendations',
      icon: BookOpen,
      color: '#059669',
      bgColor: '#f0fdf4',
      status: 'active',
      capabilities: ['Parenting Tips', 'Safety Guidance', 'Educational Resources', 'Age-Appropriate Content', 'Communication Strategies', 'Digital Wellness']
    }
  ];

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      message: chatMessage,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');
    setIsAgentTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const agent = agents.find(a => a.id === selectedAgent);
      const responses = getAgentResponse(selectedAgent, chatMessage);
      
      const agentMessage = {
        id: (Date.now() + 1).toString(),
        message: responses,
        sender: 'agent' as const,
        timestamp: new Date(),
        agentName: agent?.name
      };

      setChatHistory(prev => [...prev, agentMessage]);
      setIsAgentTyping(false);
    }, 1500);
  };

  const getAgentResponse = (agentId: string, message: string) => {
    const lowerMessage = message.toLowerCase();
    
    switch (agentId) {
      case 'analysis':
        if (lowerMessage.includes('threat') || lowerMessage.includes('danger') || lowerMessage.includes('security')) {
          return "I've analyzed today's security data: 3 immediate threats detected, including an attempted access to an inappropriate chat platform at 3:45 PM. Threat patterns show 62% increase from last week. The analysis indicates these were automated attempts rather than intentional browsing. I recommend reviewing your content filters and discussing online safety with Emma.";
        }
        if (lowerMessage.includes('time') || lowerMessage.includes('usage') || lowerMessage.includes('screen')) {
          return "Emma's screen time analysis: 3h 35m today (+15% from yesterday). Peak usage: 2-4 PM and 7-9 PM. Educational content dominates at 58% (125 minutes), showing positive learning engagement. However, she exceeded educational limits by 5 minutes. Trend analysis suggests consistent daily patterns with weekend spikes.";
        }
        if (lowerMessage.includes('pattern') || lowerMessage.includes('behavior') || lowerMessage.includes('trend')) {
          return "Behavioral analysis reveals: Emma prefers STEM content (Khan Academy, Scratch), browses primarily in afternoon/evening blocks, shows 85% compliance with safety guidelines. Weekly trends indicate increasing educational engagement but also rising entertainment consumption. Risk factors: 3 inappropriate content attempts this week vs 1 last week.";
        }
        if (lowerMessage.includes('report') || lowerMessage.includes('summary')) {
          return "Current analytics summary: Safety Score 65/100, Screen Time 25.5h this week, Educational Focus 58%, Threat Detection 13 blocks, Compliance Rate 85%. Key insight: Emma's digital habits are generally positive but require monitoring of social media curiosity and discussion about online safety boundaries.";
        }
        return "I analyze Emma's browsing data to provide insights on usage patterns, threat detection, and behavioral trends. Today I've processed 87 websites, identified 3 security concerns, and tracked 3h 35m of activity. What specific analysis would you like me to provide?";
        
      case 'advice':
        if (lowerMessage.includes('talk') || lowerMessage.includes('discuss') || lowerMessage.includes('conversation')) {
          return "For discussing today's security incidents with Emma: Start with positives (great educational engagement!), then address concerns non-accusatorily. Try: 'I noticed some sites were blocked today - can you tell me about what you were looking for?' Focus on online safety education rather than punishment. At 12, Emma needs clear boundaries with explanations.";
        }
        if (lowerMessage.includes('restrict') || lowerMessage.includes('limit') || lowerMessage.includes('control')) {
          return "For a 12-year-old like Emma: Balance freedom with safety. Current 3h 35m screen time is reasonable if educational. Consider implementing 'earned time' - extra screen time for completing homework/chores. Use content filtering as a safety net, not a barrier to learning. Involve Emma in creating family digital rules.";
        }
        if (lowerMessage.includes('education') || lowerMessage.includes('learn') || lowerMessage.includes('teach')) {
          return "Emma's showing excellent educational engagement (58% of time). To encourage this: 1) Praise her Khan Academy progress specifically, 2) Connect her interests (coding) to real-world applications, 3) Consider family coding projects, 4) Set up 'learning challenges' with small rewards. Her STEM interest is valuable - nurture it!";
        }
        if (lowerMessage.includes('safety') || lowerMessage.includes('online') || lowerMessage.includes('internet')) {
          return "For 12-year-olds like Emma: Discuss digital citizenship openly. Explain that blocks aren't punishment but protection. Teach her to recognize inappropriate content and report concerns. Create an open environment where she feels safe asking questions about confusing online content. Consider family media agreements.";
        }
        if (lowerMessage.includes('age') || lowerMessage.includes('appropriate') || lowerMessage.includes('12')) {
          return "At 12, Emma is developing digital independence. Age-appropriate strategies: Explain 'why' behind rules, gradually increase privileges with demonstrated responsibility, focus on critical thinking about online content, and maintain open communication. Her curiosity about restricted content is normal - use it as teaching moments.";
        }
        return "I provide parenting guidance for managing Emma's digital wellbeing. Based on her profile (12 years old, strong educational engagement, some security concerns), I can offer advice on communication strategies, age-appropriate boundaries, and positive reinforcement approaches. What specific parenting challenge can I help with?";
        
      default:
        return "I'm here to help you with parenting guidance and analyzing Emma's digital behavior. You can ask me about communication strategies, age-appropriate boundaries, or how to interpret the monitoring data.";
    }
  };

  const handleAgentChange = (agentId: string) => {
    setSelectedAgent(agentId);
    const agent = agents.find(a => a.id === agentId);
    
    // Add welcome message from new agent
    const welcomeMessage = {
      id: Date.now().toString(),
      message: `Hi! I'm the ${agent?.name}. ${agent?.description}. How can I assist you with Emma's digital wellbeing today?`,
      sender: 'agent' as const,
      timestamp: new Date(),
      agentName: agent?.name
    };
    
    setChatHistory([welcomeMessage]);
  };

  // Child profile management functions
  const addChildProfile = () => {
    if (!newChildName.trim() || !newChildAge.trim()) return;
    
    const newProfile = {
      id: Date.now().toString(),
      name: newChildName.trim(),
      age: parseInt(newChildAge)
    };
    
    setChildProfiles(prev => [...prev, newProfile]);
    setNewChildName('');
    setNewChildAge('');
  };

  const removeChildProfile = (id: string) => {
    setChildProfiles(prev => prev.filter(child => child.id !== id));
    // If the removed child was the active one, switch to the first remaining child
    if (activeChild === childProfiles.find(child => child.id === id)?.name) {
      const remainingChildren = childProfiles.filter(child => child.id !== id);
      if (remainingChildren.length > 0) {
        setActiveChild(remainingChildren[0].name);
      }
    }
  };

  const startEditingChild = (child: {id: string, name: string, age: number}) => {
    setEditingChild(child);
  };

  const saveEditingChild = () => {
    if (!editingChild || !editingChild.name.trim()) return;
    
    setChildProfiles(prev => prev.map(child => 
      child.id === editingChild.id 
        ? { ...child, name: editingChild.name.trim(), age: editingChild.age }
        : child
    ));
    
    // Update active child name if it was edited
    const originalChild = childProfiles.find(child => child.id === editingChild.id);
    if (originalChild && activeChild === originalChild.name) {
      setActiveChild(editingChild.name.trim());
    }
    
    setEditingChild(null);
  };

  const cancelEditingChild = () => {
    setEditingChild(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Immediate Threat Warning Banner */}
      {immediateThreats > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <span className="font-medium">Security Alert!</span> {immediateThreats} immediate threat{immediateThreats > 1 ? 's' : ''} detected that require{immediateThreats === 1 ? 's' : ''} your immediate attention.
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const immediateFlag = threatFlags.find(flag => flag.type === 'immediate');
                      if (immediateFlag) handleFlagClick(immediateFlag);
                    }}
                    className="text-red-700 hover:bg-red-100"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b bg-card">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                className="w-12 h-12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Clipping path for the shield shape */}
                  <clipPath id="shield-clip">
                    <path d="M24 4L8 10v10c0 10 6.27 19.38 16 21 9.73-1.62 16-11 16-21V10L24 4z" />
                  </clipPath>
                </defs>
                
                {/* Google Blue - Top Left Quadrant */}
                <polygon
                  points="24,4 8,10 8,20 24,22 24,4"
                  fill="#4285F4"
                  clipPath="url(#shield-clip)"
                />
                
                {/* Google Red - Top Right Quadrant */}
                <polygon
                  points="24,4 40,10 40,20 24,22 24,4"
                  fill="#EA4335"
                  clipPath="url(#shield-clip)"
                />
                
                {/* Google Yellow - Bottom Left Quadrant */}
                <polygon
                  points="8,20 24,22 24,41 8,20"
                  fill="#FBBC04"
                  clipPath="url(#shield-clip)"
                />
                
                {/* Google Green - Bottom Right Quadrant */}
                <polygon
                  points="40,20 24,22 24,41 40,20"
                  fill="#34A853"
                  clipPath="url(#shield-clip)"
                />
                
                {/* White border around the entire shield */}
                <path
                  d="M24 4L8 10v10c0 10 6.27 19.38 16 21 9.73-1.62 16-11 16-21V10L24 4z"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                
                {/* Center dividing lines */}
                <line x1="24" y1="4" x2="24" y2="41" stroke="rgba(255,255,255,0.4)" strokeWidth="1" clipPath="url(#shield-clip)" />
                <line x1="8" y1="20" x2="40" y2="20" stroke="rgba(255,255,255,0.4)" strokeWidth="1" clipPath="url(#shield-clip)" />
                
                {/* Checkmark circle background */}
                <circle
                  cx="24"
                  cy="20"
                  r="7"
                  fill="rgba(255, 255, 255, 0.95)"
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth="1"
                />
                
                {/* Google-colored checkmark */}
                <path
                  d="M20 20l2 2 4-4"
                  stroke="#34A853"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <div>
                <h1 className="text-3xl font-bold">Aegis</h1>
                <p className="text-muted-foreground">Keep your children safe online with detailed insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="monitoring-toggle">Monitoring</Label>
                <Switch
                  id="monitoring-toggle"
                  checked={monitoringEnabled}
                  onCheckedChange={setMonitoringEnabled}
                />
              </div>
              <Badge variant={monitoringEnabled ? "default" : "secondary"}>
                {monitoringEnabled ? "Active" : "Paused"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Child Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Current Child Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                  {activeChild.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{activeChild}</h3>
                  <p className="text-sm text-muted-foreground">
                    Age {childProfiles.find(child => child.name === activeChild)?.age || 'Unknown'} • Active since 9:00 AM today
                  </p>
                </div>
              </div>
              <Select value={activeChild} onValueChange={setActiveChild}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {childProfiles.map((child) => (
                    <SelectItem key={child.id} value={child.name}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            {/* Stats Grid - Only Screen Time + Threat Flags */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Today's Screen Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">3h 35m</div>
                  <p className="text-xs text-muted-foreground">+15% from yesterday</p>
                </CardContent>
              </Card>

              {/* Three Threat Flag Cards - Now Clickable */}
              {threatFlags.map((flag, index) => {
                const IconComponent = flag.icon;
                return (
                  <Card 
                    key={index} 
                    className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-opacity-60"
                    onClick={() => handleFlagClick(flag)}
                    style={{ 
                      borderColor: flag.color + '40',
                      backgroundColor: flag.bgColor + '20'
                    }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm capitalize">{flag.type}</CardTitle>
                      <IconComponent className="h-4 w-4" style={{ color: flag.color }} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl" style={{ color: flag.color }}>{flag.count}</div>
                      <p className="text-xs text-muted-foreground">{flag.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 opacity-70">Click to view details</p>
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
                    <Button variant="ghost" size="sm" onClick={closeFlagDetails}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    {selectedFlag.details.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedFlag.details.activities.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">Activity Categories:</h4>
                      {selectedFlag.details.activities.map((activity, index) => (
                        <Collapsible key={index}>
                          <CollapsibleTrigger 
                            className="flex items-center justify-between w-full p-3 text-left hover:bg-muted/50 rounded-lg border"
                            onClick={() => toggleActivity(activity.title)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedFlag.color }}></div>
                              <span className="font-medium">{activity.title}</span>
                              <Badge variant="secondary">{activity.items.length}</Badge>
                            </div>
                            {openActivities.has(activity.title) ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-3 pb-3">
                            <div className="space-y-3 mt-3">
                              {activity.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="p-3 border rounded-lg bg-muted/20 ml-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                        <code className="text-sm bg-muted px-2 py-1 rounded">
                                          {item.url}
                                        </code>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {item.description}
                                      </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                      {item.timestamp}
                                    </span>
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
                      <p>No {selectedFlag.type} threats detected today.</p>
                      <p className="text-sm mt-1">This is a good sign! Keep monitoring for continued safety.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Screen Time</CardTitle>
                  <CardDescription>Daily usage patterns over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weeklyUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} minutes`, 'Screen Time']} />
                      <Area type="monotone" dataKey="screenTime" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Aegis Says Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Aegis Says:
                  </CardTitle>
                  <CardDescription>AI-powered insights and recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm leading-relaxed text-foreground">
                    {aegisReport.summary}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Insights:</h4>
                    <ul className="space-y-1">
                      {aegisReport.keyInsights.map((insight, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground italic">
                      {aegisReport.timestamp}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Weekly Threat Trends
                  </CardTitle>
                  <CardDescription>
                    Daily threat level detection over the past week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="neutral" fill="#16a34a" name="Neutral" />
                      <Bar dataKey="intermediate" fill="#eab308" name="Intermediate" />
                      <Bar dataKey="immediate" fill="#dc2626" name="Immediate" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Activity Report
                  </CardTitle>
                  <CardDescription>Generate comprehensive activity reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <h4 className="font-medium mb-2">Latest Report Available</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Comprehensive analysis of Emma's browsing activity from the past 7 days, including threat detection, time usage patterns, and safety recommendations.
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Coverage: Aug 13 - Aug 20, 2025</span>
                        <span>Last updated: 2 hours ago</span>
                      </div>
                    </div>

                    <Button 
                      onClick={generateDetailedReport} 
                      className="w-full"
                      disabled={isGeneratingReport}
                    >
                      {isGeneratingReport ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>Report includes:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Detailed browsing timeline</li>
                        <li>Threat analysis and blocked sites</li>
                        <li>Time usage breakdown by category</li>
                        <li>Safety score and recommendations</li>
                        <li>Parental guidance suggestions</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generated Report Display */}
            {generatedReport && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Latest Activity Report - {generatedReport.child}
                  </CardTitle>
                  <CardDescription>
                    Generated {generatedReport.generatedAt.toLocaleString()} • Coverage: {generatedReport.period}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/20 rounded-lg border">
                      <div className="text-2xl font-medium">{generatedReport.summary.totalScreenTime}</div>
                      <p className="text-sm text-muted-foreground">Total Screen Time</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg border">
                      <div className="text-2xl font-medium">{generatedReport.summary.sitesVisited}</div>
                      <p className="text-sm text-muted-foreground">Sites Visited</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg border">
                      <div className="text-2xl font-medium">{generatedReport.summary.sitesBlocked}</div>
                      <p className="text-sm text-muted-foreground">Sites Blocked</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg border">
                      <div className="text-2xl font-medium">{generatedReport.summary.safetyScore}/100</div>
                      <p className="text-sm text-muted-foreground">Safety Score</p>
                    </div>
                  </div>

                  {/* Threat Summary */}
                  <div className="p-4 bg-muted/10 rounded-lg border">
                    <h4 className="font-medium mb-3">Threat Detection Summary</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-medium text-green-600">
                          {generatedReport.summary.threatFlags.neutral}
                        </div>
                        <p className="text-sm text-muted-foreground">Neutral</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-medium text-orange-600">
                          {generatedReport.summary.threatFlags.intermediate}
                        </div>
                        <p className="text-sm text-muted-foreground">Intermediate</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-medium text-red-600">
                          {generatedReport.summary.threatFlags.immediate}
                        </div>
                        <p className="text-sm text-muted-foreground">Immediate</p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Breakdown */}
                  <div>
                    <h4 className="font-medium mb-3">Activity Breakdown</h4>
                    <div className="space-y-3">
                      {generatedReport.topActivities.map((activity: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                          <div>
                            <span className="font-medium">{activity.category}</span>
                            <span className="text-sm text-muted-foreground ml-2">({activity.percentage}%)</span>
                          </div>
                          <span className="font-medium">{activity.timeSpent}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div>
                    <h4 className="font-medium mb-3">Key Insights</h4>
                    <ul className="space-y-2">
                      {generatedReport.keyInsights.map((insight: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-medium mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {generatedReport.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-blue-900 dark:text-blue-100">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => setGeneratedReport(null)}>
                      <X className="w-4 h-4 mr-2" />
                      Close Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={generateDetailedReport}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Browsing Activity</CardTitle>
                <CardDescription>
                  Detailed log of all browsing sessions and blocked attempts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/20 rounded-lg">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by website name, domain, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="allowed">Allowed</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="flagged">Flagged</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>

                    {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Showing {filteredBrowsingHistory.length} of {browsingHistory.length} activities
                  </span>
                  {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                    <span>Filters applied</span>
                  )}
                </div>

                {/* Activity List */}
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {filteredBrowsingHistory.length > 0 ? (
                      filteredBrowsingHistory.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center space-x-4">
                            {getStatusIcon(session.status)}
                            <div>
                              <h4 className="font-medium">{session.website}</h4>
                              <p className="text-sm text-muted-foreground">{session.domain}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={getCategoryColor(session.category)}>
                              {session.category}
                            </Badge>
                            <div className="text-right">
                              <p className="text-sm font-medium">{session.timeSpent}m</p>
                              <p className="text-xs text-muted-foreground">
                                {session.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No activities found matching your search criteria.</p>
                        <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
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
              {/* Agent Selection Panel */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    AI Agents
                  </CardTitle>
                  <CardDescription>
                    Select an agent to interact with and get specialized help
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agents.map((agent) => {
                    const IconComponent = agent.icon;
                    const isSelected = selectedAgent === agent.id;
                    
                    return (
                      <div
                        key={agent.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          isSelected 
                            ? 'border-primary shadow-md' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        style={{ 
                          backgroundColor: isSelected ? agent.bgColor : undefined 
                        }}
                        onClick={() => handleAgentChange(agent.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div 
                            className="p-2 rounded-full flex-shrink-0"
                            style={{ 
                              backgroundColor: agent.color,
                              color: 'white'
                            }}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium truncate">{agent.name}</h4>
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: agent.color + '20',
                                  color: agent.color 
                                }}
                              >
                                {agent.status}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {agent.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-1">
                              {agent.capabilities.slice(0, 2).map((cap, index) => (
                                <span 
                                  key={index}
                                  className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                                >
                                  {cap}
                                </span>
                              ))}
                              {agent.capabilities.length > 2 && (
                                <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                                  +{agent.capabilities.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Chat Interface */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Chat with {agents.find(a => a.id === selectedAgent)?.name}
                  </CardTitle>
                  <CardDescription>
                    Ask questions, get insights, and manage Emma's digital wellbeing through natural conversation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chat History */}
                  <ScrollArea className="h-96 w-full rounded-md border p-4">
                    <div className="space-y-4">
                      {chatHistory.map((chat) => (
                        <div
                          key={chat.id}
                          className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              chat.sender === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {chat.sender === 'agent' && chat.agentName && (
                              <div className="text-xs text-muted-foreground mb-1 font-medium">
                                {chat.agentName}
                              </div>
                            )}
                            <p className="text-sm leading-relaxed">{chat.message}</p>
                            <div className="text-xs mt-2 opacity-70">
                              {chat.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Typing Indicator */}
                      {isAgentTyping && (
                        <div className="flex justify-start">
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">
                                {agents.find(a => a.id === selectedAgent)?.name} is typing...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask your agent anything about Emma's digital safety..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={isAgentTyping}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={isAgentTyping || !chatMessage.trim()}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    {selectedAgent === 'analysis' ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setChatMessage("What threats were detected today?")}
                          disabled={isAgentTyping}
                        >
                          Threat Analysis
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setChatMessage("Show me usage patterns")}
                          disabled={isAgentTyping}
                        >
                          Usage Patterns
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setChatMessage("Analyze screen time trends")}
                          disabled={isAgentTyping}
                        >
                          Screen Time Analysis
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setChatMessage("Generate behavior report")}
                          disabled={isAgentTyping}
                        >
                          Behavior Report
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setChatMessage("How should I talk to Emma about online safety?")}
                          disabled={isAgentTyping}
                        >
                          Safety Discussion
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setChatMessage("What screen time limits are appropriate for a 12-year-old?")}
                          disabled={isAgentTyping}
                        >
                          Age-Appropriate Limits
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setChatMessage("How can I encourage educational content?")}
                          disabled={isAgentTyping}
                        >
                          Educational Encouragement
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setChatMessage("What should I do about blocked content attempts?")}
                          disabled={isAgentTyping}
                        >
                          Handle Blocked Content
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agent Capabilities Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Capabilities Overview</CardTitle>
                <CardDescription>
                  See what each AI agent can help you with for comprehensive child monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map((agent) => {
                    const IconComponent = agent.icon;
                    
                    return (
                      <div 
                        key={agent.id}
                        className="p-4 rounded-lg border"
                        style={{ backgroundColor: agent.bgColor }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="p-2 rounded-full"
                            style={{ 
                              backgroundColor: agent.color,
                              color: 'white'
                            }}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <h4 className="font-medium">{agent.name}</h4>
                        </div>
                        
                        <ul className="space-y-1">
                          {agent.capabilities.map((capability, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div 
                                className="w-1 h-1 rounded-full flex-shrink-0"
                                style={{ backgroundColor: agent.color }}
                              ></div>
                              {capability}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              {/* Add New Child Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Child Profile
                  </CardTitle>
                  <CardDescription>
                    Create a new monitoring profile for your child
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="child-name">Child's Name</Label>
                      <Input
                        id="child-name"
                        placeholder="Enter full name"
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="child-age">Age</Label>
                      <Input
                        id="child-age"
                        type="number"
                        placeholder="Age"
                        min="1"
                        max="18"
                        value={newChildAge}
                        onChange={(e) => setNewChildAge(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={addChildProfile}
                        disabled={!newChildName.trim() || !newChildAge.trim()}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Child Profiles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Child Profiles ({childProfiles.length})
                  </CardTitle>
                  <CardDescription>
                    Manage existing child monitoring profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {childProfiles.length > 0 ? (
                    <div className="space-y-4">
                      {childProfiles.map((child) => (
                        <div
                          key={child.id}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            activeChild === child.name
                              ? 'border-primary bg-primary/5'
                              : 'border-border'
                          }`}
                        >
                          {editingChild && editingChild.id === child.id ? (
                            // Edit Mode
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                  value={editingChild.name}
                                  onChange={(e) => setEditingChild({
                                    ...editingChild,
                                    name: e.target.value
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Age</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="18"
                                  value={editingChild.age}
                                  onChange={(e) => setEditingChild({
                                    ...editingChild,
                                    age: parseInt(e.target.value) || 0
                                  })}
                                />
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={saveEditingChild}
                                disabled={!editingChild.name.trim()}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditingChild}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                  {child.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-medium">{child.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {child.age} years old
                                  </p>
                                  {activeChild === child.name && (
                                    <Badge variant="default" className="mt-1">
                                      Currently Active
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditingChild(child)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeChildProfile(child.id)}
                                  disabled={childProfiles.length === 1}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {childProfiles.length === 1 && (
                        <div className="p-3 bg-muted/20 rounded-lg border border-dashed">
                          <p className="text-sm text-muted-foreground">
                            <AlertTriangle className="w-4 h-4 inline mr-2" />
                            You need at least one child profile. The last profile cannot be deleted.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No child profiles created yet.</p>
                      <p className="text-sm mt-1">Add your first child profile above to start monitoring.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile Management Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Profile Management Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Age-Based Filtering</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Content filtering and safety settings automatically adjust based on your child's age to provide age-appropriate protection.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Multiple Profiles</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Create separate profiles for each child to get personalized monitoring and reporting for different age groups and needs.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> Each child profile maintains separate browsing history, threat detection, and usage analytics. 
                      You can switch between profiles anytime using the dropdown at the top of the dashboard.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}