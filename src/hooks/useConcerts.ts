// Centralized concert data hook
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ConcertService } from '@/services/concertService';
import { DatabaseUtils } from '@/utils/database';
import { useToast } from '@/hooks/use-toast';
import type { Concert, SearchFilters } from '@/types';

export function useConcerts(filters: SearchFilters = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConcerts();
    if (user) fetchFavorites();
  }, [filters, user]);

  const fetchConcerts = async () => {
    try {
      const { concerts } = await ConcertService.searchConcerts(filters, 1, 200);
      setConcerts(concerts || []);
    } catch (error) {
      console.error('Error fetching concerts:', error);
      toast({
        title: "Error",
        description: "Failed to load concerts.",
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
      setFavorites(new Set(data?.map(fav => fav.concert_id).filter(Boolean) || []));
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
      const wasAdded = await DatabaseUtils.toggleFavorite(user.id, concertId, 'concert');

      setFavorites(prev => {
        const updated = new Set(prev);
        if (wasAdded) {
          updated.add(concertId);
        } else {
          updated.delete(concertId);
        }
        return updated;
      });

      toast({ title: wasAdded ? "Added to favorites" : "Removed from favorites" });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites.",
        variant: "destructive",
      });
    }
  };

  return { concerts, favorites, loading, toggleFavorite, refetch: fetchConcerts };
}