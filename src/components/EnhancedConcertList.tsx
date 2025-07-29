import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ConcertService, type Concert } from '@/services/concertService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Heart, MapPin, Clock, Users, ExternalLink, Calendar, ChevronDown, Filter } from 'lucide-react';
import { format } from 'date-fns';
import type { ConcertFilters } from '@/components/AdvancedConcertSearch';

interface EnhancedConcertListProps {
  filters: ConcertFilters;
  sortBy?: 'date' | 'title' | 'location' | 'popularity';
  viewMode?: 'list' | 'grid';
}

export function EnhancedConcertList({ 
  filters, 
  sortBy = 'date', 
  viewMode = 'list' 
}: EnhancedConcertListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageSize = 12;

  // Load initial concerts and favorites
  useEffect(() => {
    loadConcerts(true);
    if (user) {
      loadFavorites();
    }
  }, [filters, sortBy, user]);

  const loadConcerts = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : page;
      const result = await ConcertService.searchConcerts(filters, currentPage, pageSize);

      if (reset) {
        setConcerts(result.concerts);
      } else {
        setConcerts(prev => [...prev, ...result.concerts]);
      }

      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      
      if (!reset) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading concerts:', error);
      toast({
        title: "Error",
        description: "Failed to load concerts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const favoriteIds = await ConcertService.getFavoriteIds(user.id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = useCallback(async (concertId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      return;
    }

    try {
      const wasAdded = await ConcertService.toggleFavorite(user.id, concertId);
      
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (wasAdded) {
          newFavorites.add(concertId);
        } else {
          newFavorites.delete(concertId);
        }
        return newFavorites;
      });
      
      toast({
        title: wasAdded ? "Added to favorites" : "Removed from favorites",
        description: wasAdded 
          ? "Concert saved to your favorites." 
          : "Concert removed from your favorites.",
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const loadMoreConcerts = () => {
    if (!loadingMore && hasMore) {
      loadConcerts(false);
    }
  };

  // Generate concert tags for display
  const getConcertTags = (concert: Concert): string[] => {
    const tags: string[] = [];
    
    if (concert.tags) {
      tags.push(...concert.tags);
    }
    
    // Add automatic tags based on content
    if (concert.orchestra) tags.push('Orchestra');
    if (concert.program?.toLowerCase().includes('symphony')) tags.push('Symphony');
    if (concert.program?.toLowerCase().includes('concerto')) tags.push('Concerto');
    if (concert.program?.toLowerCase().includes('chamber')) tags.push('Chamber Music');
    
    return [...new Set(tags)]; // Remove duplicates
  };

  if (loading) {
    return (
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
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
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or explore different dates and locations.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear Filters & Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {concerts.length} of {totalCount} concerts
          </p>
        </div>
      </div>

      {/* Concert Grid/List */}
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {concerts.map((concert) => {
          const concertTags = getConcertTags(concert);
          
          return (
            <Card key={concert.id} className="hover:shadow-md transition-shadow">
              <CardHeader className={viewMode === 'grid' ? 'pb-3' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`${viewMode === 'grid' ? 'text-lg' : 'text-xl'} line-clamp-2`}>
                      {concert.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2 flex-wrap">
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
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
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

                {/* Program Preview */}
                {concert.program && (
                  <div>
                    <p className="text-sm font-medium mb-1">Program:</p>
                    <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                      {concert.program}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {concertTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {concertTags.slice(0, viewMode === 'grid' ? 3 : 5).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {concertTags.length > (viewMode === 'grid' ? 3 : 5) && (
                      <Badge variant="outline" className="text-xs">
                        +{concertTags.length - (viewMode === 'grid' ? 3 : 5)} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    <Badge variant="secondary">Classical</Badge>
                    {concert.price_range && (
                      <Badge variant="outline">{concert.price_range}</Badge>
                    )}
                  </div>
                  {concert.ticket_url && (
                    <Button asChild size="sm" className="gap-2">
                      <a href={concert.ticket_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        {viewMode === 'grid' ? 'Tickets' : 'Get Tickets'}
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            onClick={loadMoreConcerts}
            disabled={loadingMore}
            className="gap-2"
          >
            {loadingMore ? (
              <>Loading...</>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Load More Concerts
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}