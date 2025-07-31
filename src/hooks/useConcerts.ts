// Centralized concert data hook
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
      let query = supabase
        .from('concerts')
        .select('*')
        .order('concert_date', { ascending: true });

      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,orchestra.ilike.%${filters.searchQuery}%,conductor.ilike.%${filters.searchQuery}%`);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.dateRange?.from) {
        query = query.gte('concert_date', filters.dateRange.from.toISOString().split('T')[0]);
      }
      if (filters.dateRange?.to) {
        query = query.lte('concert_date', filters.dateRange.to.toISOString().split('T')[0]);
      }

      const { data, error } = await query;
      if (error) throw error;
      setConcerts(data || []);
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
      const isFavorite = favorites.has(concertId);
      
      if (isFavorite) {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('concert_id', concertId);
        
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(concertId);
          return newFavorites;
        });
        
        toast({ title: "Removed from favorites" });
      } else {
        await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, concert_id: concertId });
        
        setFavorites(prev => new Set([...prev, concertId]));
        toast({ title: "Added to favorites" });
      }
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