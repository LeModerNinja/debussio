import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Heart, MapPin, Clock, Users, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';

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
  created_at: string;
}

interface ConcertListProps {
  searchQuery: string;
  selectedLocation: string;
  dateRange: { from?: Date; to?: Date };
}

export function ConcertList({ searchQuery, selectedLocation, dateRange }: ConcertListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (concerts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium mb-2">No concerts found</p>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new concerts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {concerts.map((concert) => (
        <Card key={concert.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl">{concert.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {concert.venue}, {concert.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(concert.concert_date), 'MMM dd, yyyy')}
                    {concert.start_time && (
                      <span className="flex items-center gap-1 ml-2">
                        <Clock className="h-4 w-4" />
                        {concert.start_time}
                      </span>
                    )}
                  </span>
                </CardDescription>
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
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Performance Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {concert.orchestra && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Orchestra:</strong> {concert.orchestra}
                  </span>
                </div>
              )}
              {concert.conductor && (
                <div className="text-sm">
                  <strong>Conductor:</strong> {concert.conductor}
                </div>
              )}
              {concert.soloists && (
                <div className="text-sm col-span-full">
                  <strong>Soloists:</strong> {concert.soloists}
                </div>
              )}
            </div>

            {/* Program */}
            {concert.program && (
              <div>
                <p className="text-sm font-medium mb-2">Program:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {concert.program}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Badge variant="secondary">Classical</Badge>
                {concert.orchestra && <Badge variant="outline">Live Performance</Badge>}
              </div>
              {concert.ticket_url && (
                <Button asChild size="sm" className="gap-2">
                  <a href={concert.ticket_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Get Tickets
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}