import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Heart, MapPin, Clock, ExternalLink, Sparkles, RefreshCw } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ConcertService } from '@/services/concertService';
import { EventbriteService } from '@/services/eventbriteService';

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
  tags: string[] | null;
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
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [generatingTags, setGeneratingTags] = useState<Set<string>>(new Set());
  const [syncingBachtrack, setSyncingBachtrack] = useState(false);

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

  const generateTagsForConcert = async (concertId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate AI tags.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingTags(prev => new Set([...prev, concertId]));
    
    try {
      const tags = await ConcertService.generateConcertTags(concertId);
      
      // Update local state
      setConcerts(prev => prev.map(concert => 
        concert.id === concertId 
          ? { ...concert, tags }
          : concert
      ));
      
      toast({
        title: "AI Tags Generated",
        description: `Generated ${tags.length} relevant tags for this concert.`,
      });
    } catch (error) {
      console.error('Error generating tags:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI tags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingTags(prev => {
        const updated = new Set(prev);
        updated.delete(concertId);
        return updated;
      });
    }
  };

  const syncFromBachtrack = async () => {
    setSyncingBachtrack(true);
    
    try {
      const startDate = startOfMonth(calendarMonth);
      const endDate = endOfMonth(addMonths(calendarMonth, 2)); // Sync 3 months of data
      
      const result = await ConcertService.syncFromBachtrack({
        location: selectedLocation || undefined,
        dateFrom: startDate.toISOString().split('T')[0],
        dateTo: endDate.toISOString().split('T')[0],
        limit: 100,
      });
      
      if (result.success) {
        toast({
          title: "Bachtrack Sync Complete",
          description: `Successfully synced ${result.syncedCount} concerts from Bachtrack.`,
        });
        
        // Refresh concerts after sync
        fetchConcerts();
      } else {
        throw new Error(result.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Error syncing from Bachtrack:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync from Bachtrack. Please check API configuration.",
        variant: "destructive",
      });
    } finally {
      setSyncingBachtrack(false);
    }
  };

  const syncFromBandsintown = async () => {
    setLoading(true);
    
    try {
      const startDate = startOfMonth(calendarMonth);
      const endDate = endOfMonth(addMonths(calendarMonth, 2));
      
      // Common classical music artists/orchestras for search
      const classicalArtists = [
        'Vienna Philharmonic',
        'Berlin Philharmonic',
        'New York Philharmonic',
        'London Symphony Orchestra',
        'Boston Symphony Orchestra'
      ];
      
      const result = await ConcertService.syncFromBandsintown({
        dateFrom: startDate.toISOString().split('T')[0],
        dateTo: endDate.toISOString().split('T')[0],
        artists: classicalArtists,
        location: selectedLocation,
        limit: 50
      });
      
      if (result.success) {
        toast({
          title: "Bandsintown Sync Complete",
          description: `Successfully synced ${result.syncedCount} concerts from Bandsintown.`,
        });
        await fetchConcerts(); // Refresh the concerts list
      } else {
        toast({
          title: "Sync Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error syncing from Bandsintown:', error);
      toast({
        title: "Sync Error", 
        description: "Failed to sync concerts from Bandsintown",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncFromTicketMaster = async () => {
    setLoading(true);
    
    try {
      const startDate = startOfMonth(calendarMonth);
      const endDate = endOfMonth(addMonths(calendarMonth, 2));
      
      const result = await ConcertService.syncFromTicketMaster({
        dateFrom: startDate.toISOString().split('T')[0],
        dateTo: endDate.toISOString().split('T')[0],
        location: selectedLocation,
        limit: 100
      });
      
      if (result.success) {
        toast({
          title: "TicketMaster Sync Complete",
          description: `Successfully synced ${result.syncedCount} concerts from TicketMaster.`,
        });
        await fetchConcerts(); // Refresh the concerts list
      } else {
        toast({
          title: "Sync Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error syncing from TicketMaster:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync concerts from TicketMaster",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncFromEventbrite = async () => {
    if (loading) return; // Prevent multiple simultaneous syncs
    
    setLoading(true);
    try {
      const startDate = startOfMonth(calendarMonth);
      const endDate = endOfMonth(addMonths(calendarMonth, 2));
      
      const result = await EventbriteService.syncEvents({
        dateFrom: startDate.toISOString().split('T')[0],
        dateTo: endDate.toISOString().split('T')[0],
        location: selectedLocation,
        limit: 50
      });
      
      if (result.success) {
        toast({
          title: "Eventbrite Sync Complete",
          description: result.message || `Successfully synced events from Eventbrite.`,
        });
        await fetchConcerts(); // Refresh the concerts list
      } else {
        toast({
          title: "Sync Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error syncing from Eventbrite:', error);
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync concerts from Eventbrite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Concert Calendar</CardTitle>
              <CardDescription>
                Select a date to view concerts happening that day
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={syncFromEventbrite}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Eventbrite
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={syncFromTicketMaster}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                TicketMaster
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={syncFromBandsintown}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Bandsintown
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            className="rounded-md border w-full"
            modifiers={{
              hasConcerts: concertDates,
            }}
            modifiersStyles={{
              hasConcerts: { 
                backgroundColor: 'hsl(var(--primary))', 
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 'bold',
                borderRadius: '6px'
              },
            }}
          />
          <div className="mt-4 space-y-2">
            <div className="text-sm text-muted-foreground">
              <p>• Dates with concerts are highlighted</p>
              <p>• Click on a date to see concerts that day</p>
              <p>• Use the sync button to fetch latest concerts from Bachtrack</p>
            </div>
            {concerts.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{concerts.length} concerts loaded</Badge>
                <Badge variant="outline">{concertDates.length} dates with concerts</Badge>
              </div>
            )}
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

                {/* Tags and Actions */}
                <div className="space-y-3">
                  {/* AI Tags */}
                  <div className="flex flex-wrap gap-2">
                    {concert.tags && concert.tags.length > 0 ? (
                      concert.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">Classical</Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generateTagsForConcert(concert.id)}
                        disabled={generatingTags.has(concert.id)}
                        className="gap-1 text-xs"
                      >
                        {generatingTags.has(concert.id) ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        AI Tags
                      </Button>
                    </div>
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}