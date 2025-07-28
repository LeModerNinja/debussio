import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Heart, MapPin, Clock, ExternalLink } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

interface Concert {
  id: string;
  title: string;
  venue: string;
  location: string;
  concert_date: string;
  start_time: string | null;
  orchestra: string | null;
  conductor: string | null;
  soloists: string | null;
  program: string | null;
  ticket_url: string | null;
}

interface ConcertCalendarProps {
  searchQuery: string;
  selectedLocation: string;
  dateRange: { from?: Date; to?: Date };
}

export function ConcertCalendar({ searchQuery, selectedLocation, dateRange }: ConcertCalendarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchConcerts();
    if (user) {
      fetchFavorites();
    }
  }, [searchQuery, selectedLocation, dateRange, user]);

  const fetchConcerts = async () => {
    try {
      let query = supabase
        .from('concerts')
        .select('*')
        .order('concert_date', { ascending: true });

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,orchestra.ilike.%${searchQuery}%,conductor.ilike.%${searchQuery}%,soloists.ilike.%${searchQuery}%,program.ilike.%${searchQuery}%`);
      }

      // Apply location filter
      if (selectedLocation) {
        query = query.ilike('location', `%${selectedLocation}%`);
      }

      // Apply date range filter
      if (dateRange.from) {
        query = query.gte('concert_date', dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange.to) {
        query = query.lte('concert_date', dateRange.to.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConcerts(data || []);
    } catch (error) {
      console.error('Error fetching concerts:', error);
      toast({
        title: "Error",
        description: "Failed to load concerts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('concert_id')
        .eq('user_id', user.id)
        .not('concert_id', 'is', null);

      if (error) throw error;
      
      const favoriteIds = new Set(data?.map(fav => fav.concert_id).filter(Boolean) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (concertId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isFavorite = favorites.has(concertId);
      
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('concert_id', concertId);

        if (error) throw error;
        
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(concertId);
          return newFavorites;
        });
        
        toast({
          title: "Removed from favorites",
          description: "Concert removed from your favorites.",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            concert_id: concertId,
          });

        if (error) throw error;
        
        setFavorites(prev => new Set([...prev, concertId]));
        
        toast({
          title: "Added to favorites",
          description: "Concert saved to your favorites.",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get concerts for the selected date
  const selectedDateConcerts = selectedDate 
    ? concerts.filter(concert => 
        isSameDay(new Date(concert.concert_date), selectedDate)
      )
    : [];

  // Get dates that have concerts for the calendar
  const concertDates = concerts.map(concert => new Date(concert.concert_date));

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Concert Calendar</CardTitle>
          <CardDescription>
            Select a date to view concerts happening that day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border w-full"
            modifiers={{
              hasConcerts: concertDates,
            }}
            modifiersStyles={{
              hasConcerts: { 
                backgroundColor: 'hsl(var(--primary))', 
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 'bold'
              },
            }}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            <p>• Dates with concerts are highlighted</p>
            <p>• Click on a date to see concerts that day</p>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Concerts */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate 
              ? `Concerts on ${format(selectedDate, 'MMMM dd, yyyy')}`
              : 'Select a Date'
            }
          </CardTitle>
          <CardDescription>
            {selectedDateConcerts.length === 0 
              ? 'No concerts scheduled for this date'
              : `${selectedDateConcerts.length} concert${selectedDateConcerts.length > 1 ? 's' : ''} found`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedDateConcerts.map((concert) => (
              <div key={concert.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{concert.title}</h4>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {concert.venue}, {concert.location}
                      </div>
                      {concert.start_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {concert.start_time}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(concert.id)}
                    className="shrink-0"
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        favorites.has(concert.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                </div>

                {concert.orchestra && (
                  <p className="text-sm">
                    <strong>Orchestra:</strong> {concert.orchestra}
                  </p>
                )}

                {concert.conductor && (
                  <p className="text-sm">
                    <strong>Conductor:</strong> {concert.conductor}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Classical</Badge>
                  {concert.ticket_url && (
                    <Button asChild size="sm" variant="outline" className="gap-1">
                      <a href={concert.ticket_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        Tickets
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}