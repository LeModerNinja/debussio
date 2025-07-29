import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Heart, MapPin, Clock, Users, ExternalLink, Calendar, Trash2 } from 'lucide-react';
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
  tags: string[] | null;
  created_at: string;
}

export function ConcertFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoriteConcerts, setFavoriteConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavoriteConcerts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavoriteConcerts = async () => {
    if (!user) return;

    try {
      // Fetch user's favorite concerts with full concert details
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          concert_id,
          concerts (
            id,
            title,
            venue,
            location,
            concert_date,
            start_time,
            orchestra,
            conductor,
            soloists,
            program,
            ticket_url,
            tags,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .not('concert_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Extract concert data from the join
      const concerts = data
        ?.map(fav => fav.concerts)
        .filter(Boolean) as Concert[] || [];
      
      setFavoriteConcerts(concerts);
    } catch (error) {
      console.error('Error fetching favorite concerts:', error);
      toast({
        title: "Error",
        description: "Failed to load favorite concerts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (concertId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('concert_id', concertId);

      if (error) throw error;
      
      // Remove from local state
      setFavoriteConcerts(prev => prev.filter(concert => concert.id !== concertId));
      
      toast({
        title: "Removed from favorites",
        description: "Concert removed from your favorites.",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium mb-2">Sign in to save favorites</p>
          <p className="text-muted-foreground">
            Create an account to save concerts you're interested in
          </p>
        </CardContent>
      </Card>
    );
  }

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

  if (favoriteConcerts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium mb-2">No favorites yet</p>
          <p className="text-muted-foreground mb-4">
            Start exploring concerts and save the ones you're interested in
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Favorite Concerts</h2>
          <p className="text-muted-foreground">
            {favoriteConcerts.length} concert{favoriteConcerts.length > 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      {favoriteConcerts.map((concert) => (
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
                onClick={() => removeFavorite(concert.id)}
                className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
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

            {/* Tags */}
            {concert.tags && concert.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {concert.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Badge variant="secondary">Favorite</Badge>
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