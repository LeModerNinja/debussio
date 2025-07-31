// Eventbrite integration component
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, ExternalLink, Zap, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConcertService } from '@/services/concertService';

export function EventbriteIntegration() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const { toast } = useToast();

  const syncFromEventbrite = async () => {
    setLoading(true);
    try {
      const result = await ConcertService.syncFromEventbrite({
        location: 'New York',
        limit: 50
      });
      
      if (result.success) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${result.syncedCount} events from Eventbrite`,
        });
        // You could fetch and display events here
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Eventbrite Integration
              </CardTitle>
              <CardDescription>
                Discover classical music events from Eventbrite's extensive catalog
              </CardDescription>
            </div>
            <Button 
              onClick={syncFromEventbrite} 
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
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
        </CardHeader>
      </Card>

      {/* Loading State */}
      {loading && (
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
      )}

      {/* Sample Events Display */}
      {!loading && events.length === 0 && (
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