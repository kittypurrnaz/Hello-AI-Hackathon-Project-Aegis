import { MonitoringDashboard } from './components/MonitoringDashboard';
import { ExtensionPopup } from './components/ExtensionPopup';

export default function App() {
  // Check URL params or environment to determine which view to show
  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get('view');
  
  // Show extension popup if specifically requested, otherwise show full dashboard
  if (view === 'popup') {
    return <ExtensionPopup />;
  }

  return (
    <div className="min-h-screen bg-background">
      <MonitoringDashboard />
    </div>
  );
}