import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, ExternalLink, RefreshCw, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EventbriteEvent {
  id: string;
  name: {
    text: string;
  };
  start: {
    local: string;
  };
  venue?: {
    name: string;
    address: {
      city: string;
      region: string;
      country: string;
    };
  };
  url: string;
  description?: {
    text: string;
  };
  ticket_availability?: {
    minimum_ticket_price?: {
      display: string;
    };
    maximum_ticket_price?: {
      display: string;
    };
  };
}

export function EventbriteIntegration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [events, setEvents] = useState<EventbriteEvent[]>([]);
  const [syncStats, setSyncStats] = useState<{
    lastSync?: string;
    totalSynced?: number;
  }>({});

  const syncFromEventbrite = async () => {
    setLoading(true);
    
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // Next 3 months
      
      const { data, error } = await supabase.functions.invoke('eventbrite-sync', {
        body: {
          location: searchLocation || undefined,
          dateFrom: startDate.toISOString().split('T')[0],
          dateTo: endDate.toISOString().split('T')[0],
          limit: 100
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to sync from Eventbrite');
      }

      if (data.success) {
        setSyncStats({
          lastSync: new Date().toISOString(),
          totalSynced: data.syncedCount
        });
        
        toast({
          title: "Eventbrite Sync Complete",
          description: `Successfully synced ${data.syncedCount} concerts from Eventbrite.`,
        });
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Error syncing from Eventbrite:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync from Eventbrite. Please check API configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchEventbriteEvents = async () => {
    if (!searchLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a location to search for events.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // This would typically call the Eventbrite API directly for preview
      // For now, we'll trigger a sync and show results from our database
      await syncFromEventbrite();
      
      // Fetch recent concerts from our database that match the location
      const { data: concerts, error } = await supabase
        .from('concerts')
        .select('*')
        .eq('source', 'eventbrite')
        .ilike('location', `%${searchLocation}%`)
        .gte('concert_date', new Date().toISOString().split('T')[0])
        .order('concert_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      // Transform to match Eventbrite format for display
      const transformedEvents: EventbriteEvent[] = concerts?.map(concert => ({
        id: concert.id,
        name: { text: concert.title },
        start: { local: `${concert.concert_date}T${concert.start_time || '19:00'}` },
        venue: {
          name: concert.venue,
          address: {
            city: concert.location.split(',')[0] || '',
            region: concert.location.split(',')[1] || '',
            country: concert.location.split(',')[2] || ''
          }
        },
        url: concert.ticket_url || '',
        description: { text: concert.program || '' }
      })) || [];

      setEvents(transformedEvents);
      
    } catch (error) {
      console.error('Error searching Eventbrite events:', error);
      toast({
        title: "Search Error",
        description: "Failed to search Eventbrite events.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Eventbrite Integration
          </CardTitle>
          <CardDescription>
            Sync classical music concerts from Eventbrite to discover local performances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sync Controls */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="location">Search Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., New York, London, Berlin"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchEventbriteEvents()}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={searchEventbriteEvents}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search Events
              </Button>
              <Button 
                variant="outline"
                onClick={syncFromEventbrite}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Sync All
              </Button>
            </div>
          </div>

          {/* Sync Statistics */}
          {syncStats.lastSync && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary">
                Last sync: {new Date(syncStats.lastSync).toLocaleString()}
              </Badge>
              {syncStats.totalSynced && (
                <Badge variant="outline">
                  {syncStats.totalSynced} concerts synced
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Found Events</CardTitle>
            <CardDescription>
              Classical music events from Eventbrite in {searchLocation || 'all locations'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{event.name.text}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.start.local).toLocaleDateString()} at{' '}
                          {new Date(event.start.local).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.venue.name}, {event.venue.address.city}
                          </div>
                        )}
                      </div>
                    </div>
                    {event.url && (
                      <Button asChild size="sm" variant="outline" className="gap-1">
                        <a href={event.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                          View Event
                        </a>
                      </Button>
                    )}
                  </div>
                  
                  {event.description?.text && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description.text}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Badge variant="secondary">Eventbrite</Badge>
                    <Badge variant="outline">Classical</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Get Eventbrite API Token</h4>
            <p className="text-sm text-muted-foreground">
              Visit the{' '}
              <a 
                href="https://www.eventbrite.com/platform/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Eventbrite API documentation
              </a>{' '}
              to create an account and get your API token.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Configure Environment Variables</h4>
            <p className="text-sm text-muted-foreground">
              Add your Eventbrite token to the Supabase Edge Functions environment:
            </p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              EVENTBRITE_TOKEN=your_eventbrite_token_here
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Features Available</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Automatic sync of classical music events</li>
              <li>• Location-based event filtering</li>
              <li>• Price range and ticket information</li>
              <li>• Integration with your concert calendar</li>
              <li>• Duplicate detection and prevention</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}