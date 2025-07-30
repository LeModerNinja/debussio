import { Navigation } from '@/components/Navigation';
import { EventbriteIntegration } from '@/components/EventbriteIntegration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Zap, Globe, Users } from 'lucide-react';

export default function EventbriteDemo() {
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
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Smart Filtering</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keyword-based classical music detection</li>
                  <li>• Venue and organizer reputation scoring</li>
                  <li>• Duplicate event prevention</li>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}