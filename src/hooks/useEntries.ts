// Centralized data fetching hook
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { UserEntry, SearchFilters } from '@/types';

export function useEntries(type?: 'recording' | 'concert', filters: SearchFilters = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, type, filters]);

  const fetchEntries = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('user_entries')
        .select(`
          *,
          recordings:recording_id (
            id, orchestra, conductor, soloists, label, album_title, release_year,
            pieces:piece_id (
              id, title, opus_number, key_signature, genre, duration_minutes,
              composers:composer_id (id, name, period)
            )
          ),
          concerts:concert_id (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (type) query = query.eq('entry_type', type);

      const { data, error } = await query;
      if (error) throw error;

      const transformedEntries = data?.map(entry => ({
        ...entry,
        recording: entry.recordings ? {
          ...entry.recordings,
          piece: entry.recordings.pieces ? {
            ...entry.recordings.pieces,
            composer: entry.recordings.pieces.composers
          } : null
        } : null,
        concert: entry.concerts || null
      })) || [];

      setEntries(applyFilters(transformedEntries, filters));
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast({
        title: "Error",
        description: "Failed to load entries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (entries: UserEntry[], filters: SearchFilters) => {
    return entries.filter(entry => {
      if (filters.general) {
        const searchText = [
          entry.notes,
          entry.recording?.piece?.title,
          entry.recording?.piece?.composer?.name,
          entry.recording?.orchestra,
          entry.concert?.title,
          entry.concert?.venue
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchText.includes(filters.general.toLowerCase())) return false;
      }

      if (filters.composer && entry.recording?.piece?.composer?.name) {
        if (!entry.recording.piece.composer.name.toLowerCase().includes(filters.composer.toLowerCase())) {
          return false;
        }
      }

      if (filters.rating && entry.rating) {
        if (entry.rating < parseInt(filters.rating)) return false;
      }

      return true;
    });
  };

  const deleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('user_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user?.id);

      if (error) throw error;
      setEntries(entries.filter(entry => entry.id !== entryId));
      toast({ title: "Success", description: "Entry deleted successfully." });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    }
  };

  return { entries, loading, deleteEntry, refetch: fetchEntries };
}