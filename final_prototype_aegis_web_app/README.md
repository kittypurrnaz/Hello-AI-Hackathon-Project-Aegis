# Aegis Child Monitoring Dashboard

A comprehensive, AI-powered web application for monitoring and protecting children's online browsing activity. Built with React, TypeScript, and modern web technologies using **Figma Make**.

* **Frontend**: The user interface is built with **React** and **TypeScript**. It features a responsive design created in **Figma** and implemented with **Tailwind CSS v4** and **ShadCN UI components**. The dashboard utilizes **Recharts** for clear data visualization.
* **Backend**: The backend is a robust ingestion hub built with **FastAPI** on **Google Cloud Run**. It uses **Pydantic** for strict data validation and **CORS** for secure communication. Data is streamed to **BigQuery** via **Pub/Sub** and processed by **Dataflow** for analysis. The Node.js API server, also deployed on Google Cloud Run, serves as the primary communication layer for the frontend. It exposes the following key endpoints:
    * `/api/users`: Fetches a list of unique user IDs from BigQuery to populate the user selection dropdown.
    * `/api/dashboard-metrics/:userId`: Retrieves aggregated data (total events, immediate/intermediate/neutral flags) for a specific user and a given date range to power the main dashboard metrics and charts.
    * `/api/activity-log/:userId`: Fetches the raw activity log for a specific user, enabling the detailed view of all flagged events.
    * `/api/summarize-activity`: Uses the **Gemini API** to generate a natural language summary and actionable advice based on a provided set of flagged activity data.
* **Chrome Extension**: The **Manifest V3** Chrome extension collects data by monitoring web navigation. It uses the **Gemini API** for on-device text analysis of URLs and for visual context from screenshots. It authenticates with the **chrome.identity API** to securely communicate with the backend.
* **Agentspace AI**: The Aegis Agent provides conversational, context-aware guidance to parents. It uses data from **BigQuery** to generate empathetic and actionable advice in natural language.

---

## 🏗️ **Built with Figma Make**

This application was created using **Figma Make**, Figma's AI-powered web application builder that transforms ideas into production-ready React applications. Figma Make enabled rapid prototyping and development of this comprehensive monitoring dashboard with advanced features like AI agents, real-time threat detection, and interactive data visualizations.

## ⚡ **Quick Start**

1. **Entry Point**: Open `index.html` in your browser
2. **Default View**: Full monitoring dashboard loads automatically
3. **Extension View**: Add `?view=popup` to URL for Chrome extension interface
4. **Switch Profiles**: Use the dropdown at the top to switch between child profiles

## 🏛️ **Architecture Overview**

### **Entry Points & Routing**
```
index.html → App.tsx → Route Decision
├── Default → MonitoringDashboard.tsx (Full Dashboard)
└── ?view=popup → ExtensionPopup.tsx (Chrome Extension)
```

### **Core Components**
- **`App.tsx`** - Main router and entry point
- **`MonitoringDashboard.tsx`** - Primary dashboard with 5 tabs
- **`ExtensionPopup.tsx`** - Chrome extension popup interface
- **`ChromeExtensionToggle.tsx`** - Extension control widget

## 🛠️ **Technology Stack**

### **Core Framework**
- **React 18** with **TypeScript** (.tsx files)
- **Modern Functional Components** with React Hooks
- **Client-side routing** via URL parameters

### **Styling & Design**
- **Tailwind CSS v4** - Latest version with enhanced CSS variables
- **ShadCN UI** - 39 pre-built, accessible components
- **Custom Design System** - Google-inspired color scheme
- **Responsive Design** - Mobile-first approach

### **Data Visualization**
- **Recharts** - React charting library for:
  - Area charts (screen time trends)
  - Bar charts (threat detection patterns)
  - Pie charts (category usage breakdown)
  - Line charts (activity patterns)

### **Icons & Assets**
- **Lucide React** - 1000+ modern icons
- **Custom SVG Logo** - Multi-colored shield design
- **Three logo variants** - Standard, large, and monochrome

## 📱 **Application Features**

### **5 Main Dashboard Tabs**

#### 1. **Overview Tab**
- **Real-time Stats**: Screen time, threat detection counters
- **Interactive Threat Flags**: Click to view detailed threat analysis
- **Weekly Charts**: Screen time trends with area charts
- **AI Insights**: "Aegis Says" recommendations with behavioral analysis

#### 2. **Reports Tab**
- **Threat Trend Analysis**: Weekly bar charts showing threat levels
- **PDF Report Generation**: Comprehensive activity reports
- **Generated Report Display**: Detailed analytics with recommendations
- **Export Functionality**: Download and share reports

#### 3. **Activity Log Tab**
- **Advanced Filtering**: Search by website, domain, category
- **Status Filtering**: Allowed, blocked, flagged content
- **Real-time Updates**: Live browsing session tracking
- **Detailed History**: Time spent, categories, threat levels

#### 4. **Agents Tab**
- **AI-Powered Chat**: Two specialized agents
  - **Analysis Agent**: Data analysis, threat detection, usage patterns
  - **Parental Advice Agent**: Guidance, safety tips, communication strategies
- **Interactive Conversations**: Natural language processing
- **Quick Actions**: Pre-defined prompts for common questions
- **Agent Capabilities**: Each agent has specialized skills

#### 5. **Settings Tab**
- **Child Profile Management**: Add, edit, remove child profiles
- **Age-based Filtering**: Automatic content adjustment
- **Profile Switching**: Easy switching between children
- **Management Tips**: Best practices and guidance

### **Advanced Features**

#### **Threat Detection System**
- **3-Tier Alert System**:
  - 🟢 **Neutral** (Low risk) - Safe educational content
  - 🟡 **Intermediate** (Moderate concerns) - Requires parental guidance
  - 🔴 **Immediate** (High priority) - Serious security/safety threats

#### **Smart Filtering & Search**
- **Real-time Search**: Instant filtering across all data
- **Multiple Filter Types**: Status, category, time-based
- **Clear Filters**: Easy reset functionality
- **Results Count**: Shows filtered vs total results

#### **Interactive Data Visualization**
- **Hover States**: Detailed tooltips on all charts
- **Responsive Charts**: Adapt to screen size
- **Color-coded Data**: Consistent color scheme throughout
- **Real-time Updates**: Charts update with new data

## 📁 **File Structure Explained**

### **Essential Files (19 total)**
```
├── App.tsx                           # Main entry point & router
├── index.html                        # HTML shell for React app
├── styles/globals.css                # Tailwind v4 configuration
├── components/
│   ├── MonitoringDashboard.tsx       # Primary dashboard (5 tabs)
│   ├── ExtensionPopup.tsx            # Chrome extension interface
│   ├── ChromeExtensionToggle.tsx     # Extension control widget
│   ├── figma/
│   │   └── ImageWithFallback.tsx     # Protected image component
│   └── ui/                           # 39 ShadCN components
├── aegis-logo*.svg                   # Three logo variants
└── guidelines/Guidelines.md          # Development guidelines
```

### **Logo Assets**
- **`aegis-logo.svg`** - Standard 48×48px (dashboard use)
- **`aegis-logo-large.svg`** - High-res 200×200px (headers/print)
- **`aegis-logo-monochrome.svg`** - Single color (watermarks/stamps)

## 🎨 **Design System**

### **Color Palette**
- **Primary**: `#030213` (Dark navy)
- **Threat Colors**: 
  - Green `#16a34a` (Safe content)
  - Orange `#ea580c` (Warning)
  - Red `#dc2626` (Danger)
- **Google-Inspired Logo**: Blue, Red, Yellow, Green quadrants

### **Typography System**
```css
/* CSS Variables in globals.css */
--font-size: 14px;
--font-weight-medium: 500;
--font-weight-normal: 400;
```

### **Component Library**
39 ShadCN components available:
- **Navigation**: Tabs, Breadcrumbs, Menus
- **Data Display**: Cards, Tables, Charts
- **Input Controls**: Forms, Switches, Selects
- **Feedback**: Alerts, Toasts, Progress bars

## 🔧 **How It Works**

### **Application Flow**
1. **Browser loads** `index.html`
2. **React mounts** `App.tsx` into `<div id="root">`
3. **Router checks** URL parameters:
   - Default → `MonitoringDashboard`
   - `?view=popup` → `ExtensionPopup`
4. **Component renders** with mock data and state management

### **State Management**
- **React Hooks**: `useState`, `useMemo`, `useEffect`
- **Complex Filtering**: Real-time search and category filtering
- **Multi-child Support**: Profile switching and data isolation
- **Chat History**: AI agent conversation management

### **Data Flow**
```
Mock Data → React State → UI Components → User Interactions → State Updates
```

### **Performance Optimizations**
- **useMemo**: Expensive filtering operations cached
- **Responsive Design**: CSS Grid adapts to screen size
- **Conditional Rendering**: Components load only when needed

## 🚀 **Key Features in Detail**

### **Multi-View Architecture**
- **Dashboard Mode**: Full monitoring interface with 5 tabs
- **Extension Mode**: Compact popup for browser integration
- **URL-based Routing**: Simple parameter switching

### **Real-time Monitoring**
- **Live Activity Tracking**: Simulated real-time browsing data
- **Threat Detection**: Automatic categorization of content
- **Usage Analytics**: Time tracking and pattern analysis

### **AI-Powered Insights**
- **Analysis Agent**: Data-driven insights and behavioral patterns
- **Parental Advice Agent**: Communication strategies and safety guidance
- **Natural Conversations**: Context-aware responses
- **Quick Actions**: Pre-built prompts for common scenarios

### **Comprehensive Reporting**
- **Weekly Trends**: Visual analytics with interactive charts
- **Threat Analysis**: Detailed breakdown of security incidents
- **PDF Generation**: Exportable reports with recommendations
- **Parent Guidance**: Actionable insights and next steps

## 🎯 **User Interaction Patterns**

### **Navigation**
- **Tab-based Interface**: 5 main sections for different functionalities
- **Child Profile Switcher**: Dropdown for multi-child families
- **Breadcrumb Navigation**: Clear location awareness

### **Filtering & Search**
- **Global Search**: Works across all data types
- **Filter Combinations**: Multiple criteria simultaneously
- **Clear Visual Feedback**: Results count and active filter indicators

### **Data Interaction**
- **Clickable Elements**: Threat flags open detailed views
- **Expandable Sections**: Collapsible content for better organization
- **Hover States**: Additional information on mouse over

## 🔒 **Security & Safety Features**

### **Content Filtering**
- **Age-appropriate Settings**: Automatic adjustment based on child's age
- **Real-time Blocking**: Immediate prevention of inappropriate access
- **Detailed Logging**: Complete audit trail of all activity

### **Threat Detection**
- **Multi-level Analysis**: 3-tier threat classification system
- **Behavioral Patterns**: AI-powered anomaly detection
- **Parent Alerts**: Immediate notification of serious threats

## 📊 **Data & Analytics**

### **Usage Metrics**
- **Screen Time Tracking**: Daily and weekly patterns
- **Category Breakdown**: Educational vs entertainment time
- **Site Analytics**: Most visited domains and duration

### **Visualization Types**
- **Area Charts**: Screen time trends over time
- **Bar Charts**: Threat detection patterns
- **Pie Charts**: Category usage distribution
- **Progress Bars**: Daily limit tracking

## 🛡️ **Browser Compatibility**

### **Modern Standards**
- **ES6+ JavaScript**: Modern language features
- **CSS Grid & Flexbox**: Advanced layout capabilities
- **React 18**: Latest framework features
- **TypeScript**: Type safety and better development experience

### **Accessibility**
- **WAI-ARIA Compliant**: ShadCN components follow accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Compatible**: Proper semantic HTML
- **Focus Management**: Logical tab order and focus states

## 📈 **Performance Metrics**

### **Optimized Codebase**
- **19 Essential Files** (reduced from 50+ during development)
- **62% File Reduction**: Streamlined from initial prototype
- **Zero Unused Dependencies**: Clean, production-ready code
- **Modular Architecture**: Easy maintenance and feature expansion

### **Loading Performance**
- **Component Lazy Loading**: Conditional rendering based on active tab
- **Optimized State Updates**: Minimal re-renders with useMemo
- **Efficient Filtering**: Fast search across large datasets

## 🔮 **Future Enhancement Opportunities**

### **Backend Integration**
- **Supabase Integration**: Real-time database and authentication
- **Live Data Sync**: Actual browsing data from browser extensions
- **Multi-device Support**: Sync across phones, tablets, computers

### **Advanced Features**
- **Machine Learning**: Enhanced threat detection algorithms
- **Parental Controls**: Remote blocking and time limits
- **Family Sharing**: Multi-parent access and notifications

### **Extended Functionality**
- **Mobile Apps**: Native iOS and Android applications
- **Email Reports**: Scheduled digest emails for parents
- **Social Features**: Family digital wellness tracking

## 📝 **Development Notes**

### **Built with Figma Make**
This application showcases the power of Figma Make for rapid development of complex, production-ready web applications. The entire frontend was generated through AI-powered design-to-code conversion, resulting in clean, maintainable React code.

### **Code Quality**
- **TypeScript**: Full type safety throughout the application
- **Modern React**: Functional components with hooks
- **Consistent Styling**: Tailwind CSS with design system
- **Component Reusability**: Modular, composable architecture

### **Maintenance**
- **Clear File Structure**: Logical organization for easy navigation
- **Documented Code**: Comments and clear naming conventions
- **Version Control Ready**: Production-ready codebase structure
- **Scalable Architecture**: Easy to extend with new features

---

**Note**: This application uses mock data for demonstration purposes. In a production environment, it would connect to real browser monitoring APIs and backend services for live data collection and storage.
