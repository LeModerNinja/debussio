import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { EventbriteIntegration } from '@/components/EventbriteIntegration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Zap, Globe, Users, ExternalLink, TrendingUp } from 'lucide-react';
import { EventbriteService } from '@/services/eventbriteService';
import { useToast } from '@/hooks/use-toast';

export default function EventbriteDemo() {
  const [quickStats, setQuickStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      const stats = await EventbriteService.getSyncStats();
      setQuickStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const quickSync = async () => {
    try {
      toast({ title: "Quick Sync", description: "Starting quick sync for New York area..." });
      
      const result = await EventbriteService.searchClassicalEvents({
        location: 'New York',
        limit: 25
      });
      
      if (result.success) {
        toast({
          title: "Quick Sync Complete",
          description: `Found ${result.syncedCount} new events in New York area.`,
        });
        loadQuickStats(); // Refresh stats
      }
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to perform quick sync. Check API configuration.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header Section */}
      <div className="border-b border-border/40 bg-gradient-to-r from-background via-background/90 to-background">
        <div className="content-container py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gradient-primary">
              <Calendar className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-serif mb-2">Eventbrite Integration</h1>
              <p className="text-xl text-muted-foreground">
                Discover classical music events from Eventbrite's global platform
              </p>
            </div>
          </div>
          
          {/* Features Overview */}
          {quickStats && (
            <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-medium">Quick Stats:</span>
                  <Badge variant="secondary">{quickStats.totalEventbriteEvents} total events</Badge>
                  <Badge variant="outline">{quickStats.upcomingEvents} upcoming</Badge>
                </div>
                <Button onClick={quickSync} size="sm" variant="outline">Quick Sync NYC</Button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Global Events</p>
                    <p className="text-xs text-muted-foreground">Worldwide coverage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Real-time Sync</p>
                    <p className="text-xs text-muted-foreground">Live updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Community Events</p>
                    <p className="text-xs text-muted-foreground">Local organizers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Smart Filtering</p>
                    <p className="text-xs text-muted-foreground">Classical focus</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-container py-8">
        <EventbriteIntegration />
        
        {/* Additional Information */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-green-700">
              <li>Get your Eventbrite API token from <a href="https://www.eventbrite.com/platform/api" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Eventbrite Developer Portal</a></li>
              <li>Configure the <code>EVENTBRITE_TOKEN</code> environment variable in Supabase Edge Functions</li>
              <li>Click "Test API" to verify your configuration</li>
              <li>Use "Sync Events" to fetch classical music events</li>
              <li>Events will appear in your Calendar and Concerts pages</li>
            </ol>
          </CardContent>
        </Card>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Eventbrite Integration</CardTitle>
            <CardDescription>
              How we use Eventbrite to enhance your classical music discovery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">What We Sync</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Classical music concerts and recitals</li>
                  <li>• Orchestra and chamber music performances</li>
                  <li>• Opera and vocal performances</li>
                  <li>• Music festivals and special events</li>
                  <li>• Educational concerts and masterclasses</li>
                  <li>• Community and amateur performances</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Smart Filtering</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keyword-based classical music detection</li>
                  <li>• Venue and organizer reputation scoring</li>
                  <li>• Duplicate event prevention</li>
                  <li>• Enhanced content filtering</li>
                  <li>• Location-based relevance</li>
                  <li>• Price and accessibility information</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Data Privacy & Usage</h4>
              <p className="text-sm text-muted-foreground">
                We only sync publicly available event information from Eventbrite. 
                No personal data is collected, and all event data is used solely to 
                enhance your classical music discovery experience. Events are 
                automatically updated and outdated events are removed.
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">API Rate Limits</h4>
              <p className="text-sm text-muted-foreground">
                Eventbrite allows 1000 API calls per hour. Our sync is optimized to stay within these limits while maximizing event discovery.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}