import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Shield, ShieldOff, Settings, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';

export function ChromeExtensionToggle() {
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [lastActivity, setLastActivity] = useState('No recent activity');

  const handleToggle = (enabled: boolean) => {
    setMonitoringEnabled(enabled);
    if (enabled) {
      setLastActivity('Monitoring started just now');
    } else {
      setLastActivity('Monitoring paused');
    }
  };

  return (
    <div className="w-80 p-4 space-y-4">
      {/* Logo Area - Reserved for your logo */}
      <div className="flex items-center justify-center py-3">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <span className="text-xs text-gray-500 text-center">Logo Area</span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          {monitoringEnabled ? (
            <Eye className="w-6 h-6 text-primary" />
          ) : (
            <EyeOff className="w-6 h-6 text-muted-foreground" />
          )}
          <h1 className="text-lg font-semibold">Child Monitor</h1>
        </div>
        <p className="text-sm text-muted-foreground">Browsing protection tool</p>
      </div>

      {/* Main Toggle Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="monitor-toggle" className="text-base">
                Protection Status
              </Label>
              <p className="text-sm text-muted-foreground">
                {monitoringEnabled ? 'Actively monitoring browsing' : 'Protection disabled'}
              </p>
            </div>
            <Switch
              id="monitor-toggle"
              checked={monitoringEnabled}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <Badge 
              variant={monitoringEnabled ? "default" : "secondary"}
              className="flex items-center space-x-1 px-3 py-1"
            >
              {monitoringEnabled ? (
                <>
                  <Shield className="w-3 h-3" />
                  <span>Protected</span>
                </>
              ) : (
                <>
                  <ShieldOff className="w-3 h-3" />
                  <span>Unprotected</span>
                </>
              )}
            </Badge>
          </div>

          {/* Status Information */}
          <div className="text-center space-y-1">
            <p className="text-sm">{lastActivity}</p>
            {monitoringEnabled && (
              <p className="text-xs text-muted-foreground">
                Extension is active on all tabs
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center space-x-2"
          onClick={() => {
            // This would open the full dashboard in a new tab
            console.log('Opening full dashboard...');
          }}
        >
          <Settings className="w-4 h-4" />
          <span>Open Dashboard</span>
        </Button>
        
        <div className="text-xs text-center text-muted-foreground px-2">
          Click the toggle above to start or stop monitoring your child's browsing activity
        </div>
      </div>
    </div>
  );
}