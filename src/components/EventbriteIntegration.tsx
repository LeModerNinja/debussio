// Eventbrite integration component
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, ExternalLink, Zap, Heart, RefreshCw, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EventbriteService } from '@/services/eventbriteService';
import { format } from 'date-fns';

export function EventbriteIntegration() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [location, setLocation] = useState('New York');
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
    loadEvents();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await EventbriteService.getSyncStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const eventsData = await EventbriteService.getEventbriteEvents({
        limit: 20
      });
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const syncFromEventbrite = async () => {
    setLoading(true);
    try {
      const result = await EventbriteService.syncEvents({
        location: location,
        limit: 100
      });
      
      if (result.success) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${result.syncedCount} events from Eventbrite.`,
        });
        
        // Refresh data after sync
        await Promise.all([loadStats(), loadEvents()]);
      } else {
        toast({
          title: "Sync Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Eventbrite sync error:', error);
      toast({
        title: "Error",
        description: "Failed to sync from Eventbrite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    try {
      // Test with a small sync to verify API connection
      await EventbriteService.syncEvents({ limit: 1 });
      toast({ title: "API Connection", description: "Eventbrite API is working correctly!" });
    } catch (error) {
      toast({ title: "API Error", description: "Failed to connect to Eventbrite API", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Synced</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalEventbriteEvents}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                  <p className="text-2xl font-bold text-green-600">{stats.upcomingEvents}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Sync</p>
                  <p className="text-sm font-medium">
                    {stats.lastSyncDate 
                      ? format(new Date(stats.lastSyncDate), 'MMM dd, HH:mm')
                      : 'Never'
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Eventbrite Sync Control
              </CardTitle>
              <CardDescription>
                Sync classical music events from Eventbrite's global platform
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={testApiConnection}
                size="sm"
                className="gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Test API
              </Button>
              <Button 
                onClick={syncFromEventbrite} 
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Sync Events
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city or region"
              />
            </div>
            <div className="space-y-2">
              <Label>Sync Options</Label>
              <p className="text-sm text-muted-foreground">
                Searches for classical music events in the specified location
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Display */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Eventbrite Events</CardTitle>
          <CardDescription>
            {events.length > 0 
              ? `Showing ${events.length} events synced from Eventbrite`
              : 'No events synced yet. Click "Sync Events" to fetch the latest classical music events.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                        <CardDescription className="mt-1">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {event.venue}, {event.location}
                          </div>
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(event.concert_date), 'MMM dd, yyyy')}
                        {event.start_time && ` at ${event.start_time}`}
                      </div>
                      
                      {event.orchestra && (
                        <p className="text-sm"><strong>Organizer:</strong> {event.orchestra}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {event.price_range || 'Price TBA'}
                        </Badge>
                        <Button variant="outline" size="sm" className="gap-1" asChild>
                          <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                            Eventbrite
                          </a>
                        </Button>
                      </div>
                      
                      {event.tags && (
                        <div className="flex flex-wrap gap-1">
                          {event.tags.slice(0, 3).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">
                Click "Sync Events" above to fetch the latest classical music events from Eventbrite.
              </p>
              <Button onClick={syncFromEventbrite} disabled={loading}>
                <Zap className="h-4 w-4 mr-2" />
                Sync Your First Events
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Information about the Eventbrite API integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Search Criteria</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keywords: classical, orchestra, symphony, opera</li>
                <li>• Category: Music events</li>
                <li>• Location-based filtering</li>
                <li>• Date range filtering</li>
                <li>• Automatic duplicate prevention</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Data Synced</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Event title and description</li>
                <li>• Venue and location details</li>
                <li>• Date and time information</li>
                <li>• Ticket pricing and availability</li>
                <li>• Direct links to Eventbrite</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              API Setup Required
            </h4>
            <p className="text-sm text-muted-foreground">
              To use this integration, you need to configure the <code>EVENTBRITE_TOKEN</code> 
              environment variable in your Supabase Edge Functions. Get your token from the 
              <a href="https://www.eventbrite.com/platform/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Eventbrite API documentation
              </a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sample event cards to show what the integration would look like */}
          {[
            {
              id: 1,
              title: "Vienna Philharmonic: Beethoven Symphony No. 9",
              venue: "Lincoln Center",
              location: "New York, NY",
              date: "2024-04-15",
              time: "8:00 PM",
              price: "$75 - $250",
              organizer: "Classical Music Society"
            },
            {
              id: 2,
              title: "Chamber Music Series: Brahms & Schumann", 
              venue: "Carnegie Hall",
              location: "New York, NY",
              date: "2024-04-18",
              time: "7:30 PM",
              price: "$45 - $120",
              organizer: "NYC Chamber Music"
            },
            {
              id: 3,
              title: "Bach Festival: Mass in B Minor",
              venue: "Cathedral of St. John",
              location: "New York, NY", 
              date: "2024-04-22",
              time: "4:00 PM",
              price: "$30 - $85",
              organizer: "Bach Society"
            }
          ].map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {event.venue}, {event.location}
                      </div>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{event.price}</Badge>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      View on Eventbrite
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Organized by {event.organizer}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Note:</strong> This is a demo of the Eventbrite integration. 
              In production, this would display real events from Eventbrite's API.
            </p>
            <p>
              The sync feature connects to Eventbrite's event discovery API to find 
              classical music performances in your area.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}