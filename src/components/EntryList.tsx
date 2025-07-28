import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Music, Calendar, Star, Edit, Trash2, ExternalLink, Clock, Building } from 'lucide-react';
import { format } from 'date-fns';
import { LibrarySearchFilters } from '@/components/LibrarySearch';

interface UserEntry {
  id: string;
  entry_type: 'recording' | 'concert';
  entry_date: string;
  rating: number | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  // Recording-related fields (joined from recordings table)
  recording?: {
    id: string;
    orchestra: string | null;
    conductor: string | null;
    soloists: string | null;
    label: string | null;
    album_title: string | null;
    release_year: number | null;
    popularity_score: number | null;
    piece: {
      id: string;
      title: string;
      opus_number: string | null;
      key_signature: string | null;
      genre: string | null;
      duration_minutes: number | null;
      composer: {
        id: string;
        name: string;
        period: string | null;
      };
    };
  };
  // Concert-related fields (joined from concerts table)
  concert?: {
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
    price_range: string | null;
  };
}

interface EntryListProps {
  type?: 'recording' | 'concert';
  searchFilters?: LibrarySearchFilters;
}

export function EntryList({ type, searchFilters = {} }: EntryListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, type, searchFilters]);

  const fetchEntries = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('user_entries')
        .select(`
          *,
          recordings:recording_id (
            id,
            orchestra,
            conductor,
            soloists,
            label,
            album_title,
            release_year,
            popularity_score,
            pieces:piece_id (
              id,
              title,
              opus_number,
              key_signature,
              genre,
              duration_minutes,
              composers:composer_id (
                id,
                name,
                period
              )
            )
          ),
          concerts:concert_id (
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
            price_range
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('entry_type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our interface
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

      // Apply search filters
      const filteredEntries = transformedEntries.filter(entry => {
        // General search across all text fields
        if (searchFilters.general) {
          const searchText = searchFilters.general.toLowerCase();
          const searchableText = [
            entry.notes,
            entry.recording?.piece?.title,
            entry.recording?.piece?.composer?.name,
            entry.recording?.orchestra,
            entry.recording?.conductor,
            entry.recording?.soloists,
            entry.recording?.album_title,
            entry.concert?.title,
            entry.concert?.venue,
            entry.concert?.location,
            entry.concert?.orchestra,
            entry.concert?.conductor,
            entry.concert?.soloists,
            entry.concert?.program
          ].filter(Boolean).join(' ').toLowerCase();
          
          if (!searchableText.includes(searchText)) return false;
        }

        // Composer filter
        if (searchFilters.composer && entry.recording?.piece?.composer?.name) {
          if (!entry.recording.piece.composer.name.toLowerCase().includes(searchFilters.composer.toLowerCase())) {
            return false;
          }
        }

        // Piece title filter
        if (searchFilters.pieceTitle) {
          const pieceTitle = entry.recording?.piece?.title || entry.concert?.title || '';
          if (!pieceTitle.toLowerCase().includes(searchFilters.pieceTitle.toLowerCase())) {
            return false;
          }
        }

        // Performer/Orchestra filter
        if (searchFilters.performer) {
          const performers = [
            entry.recording?.orchestra,
            entry.recording?.soloists,
            entry.concert?.orchestra,
            entry.concert?.soloists
          ].filter(Boolean).join(' ').toLowerCase();
          
          if (!performers.includes(searchFilters.performer.toLowerCase())) {
            return false;
          }
        }

        // Conductor filter
        if (searchFilters.conductor) {
          const conductor = entry.recording?.conductor || entry.concert?.conductor || '';
          if (!conductor.toLowerCase().includes(searchFilters.conductor.toLowerCase())) {
            return false;
          }
        }

        // Entry type filter
        if (searchFilters.entryType && entry.entry_type !== searchFilters.entryType) {
          return false;
        }

        // Rating filter
        if (searchFilters.rating && entry.rating) {
          const minRating = parseInt(searchFilters.rating);
          if (entry.rating < minRating) {
            return false;
          }
        }

        // Genre filter
        if (searchFilters.genre && entry.recording?.piece?.genre) {
          if (entry.recording.piece.genre !== searchFilters.genre) {
            return false;
          }
        }

        // Period filter
        if (searchFilters.period && entry.recording?.piece?.composer?.period) {
          if (entry.recording.piece.composer.period !== searchFilters.period) {
            return false;
          }
        }

        return true;
      });

      setEntries(filteredEntries);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast({
        title: "Error",
        description: "Failed to load your entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
      toast({
        title: "Success",
        description: "Entry deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
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

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium mb-2">No entries yet</p>
          <p className="text-muted-foreground">
            Start building your library by logging your first {type || 'entry'}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {entry.entry_type === 'recording' ? (
                    <Music className="h-4 w-4 text-primary" />
                  ) : (
                    <Calendar className="h-4 w-4 text-primary" />
                  )}
                  <Badge variant="outline">
                    {entry.entry_type === 'recording' ? 'Recording' : 'Concert'}
                  </Badge>
                  {entry.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{entry.rating}/5</span>
                    </div>
                  )}
                </div>
                
                {entry.entry_type === 'recording' && entry.recording?.piece ? (
                  <div>
                    <CardTitle className="text-xl">
                      {entry.recording.piece.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {entry.recording.piece.composer?.name}
                          {entry.recording.piece.opus_number && (
                            <span className="text-muted-foreground ml-1">
                              • {entry.recording.piece.opus_number}
                            </span>
                          )}
                        </div>
                        {entry.recording.orchestra && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {entry.recording.orchestra}
                            {entry.recording.conductor && (
                              <span className="text-muted-foreground">
                                • {entry.recording.conductor}
                              </span>
                            )}
                          </div>
                        )}
                        {entry.recording.album_title && (
                          <div className="text-sm">
                            Album: {entry.recording.album_title}
                            {entry.recording.label && (
                              <span className="text-muted-foreground ml-1">
                                ({entry.recording.label})
                              </span>
                            )}
                            {entry.recording.release_year && (
                              <span className="text-muted-foreground ml-1">
                                • {entry.recording.release_year}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                ) : entry.entry_type === 'concert' && entry.concert ? (
                  <div>
                    <CardTitle className="text-xl">{entry.concert.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {entry.concert.venue}, {entry.concert.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(entry.concert.concert_date), 'MMM dd, yyyy')}
                          {entry.concert.start_time && (
                            <span className="flex items-center gap-1 ml-2">
                              <Clock className="h-3 w-3" />
                              {entry.concert.start_time}
                            </span>
                          )}
                        </div>
                        {entry.concert.orchestra && (
                          <div className="text-sm">
                            {entry.concert.orchestra}
                            {entry.concert.conductor && (
                              <span className="text-muted-foreground ml-1">
                                • {entry.concert.conductor}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                ) : (
                  <div>
                    <CardTitle className="text-xl">Custom Entry</CardTitle>
                    <CardDescription>
                      {entry.notes ? entry.notes.split('\n')[0] : 'No title available'}
                    </CardDescription>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Entry Details */}
            <div className="text-sm space-y-2">
              <div>
                <strong>Logged on:</strong> {format(new Date(entry.entry_date), 'MMM dd, yyyy')}
              </div>
              
              {entry.notes && (
                <div>
                  <strong>Notes:</strong>
                  <p className="mt-1 text-muted-foreground">{entry.notes}</p>
                </div>
              )}
            </div>

            {/* Additional Info for Recordings */}
            {entry.entry_type === 'recording' && entry.recording?.piece && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {entry.recording.piece.key_signature && (
                  <div>
                    <strong>Key:</strong> {entry.recording.piece.key_signature}
                  </div>
                )}
                {entry.recording.piece.genre && (
                  <div>
                    <strong>Genre:</strong> {entry.recording.piece.genre}
                  </div>
                )}
                {entry.recording.piece.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {entry.recording.piece.duration_minutes} minutes
                  </div>
                )}
                {entry.recording.piece.composer?.period && (
                  <div>
                    <strong>Period:</strong> {entry.recording.piece.composer.period}
                  </div>
                )}
              </div>
            )}

            {/* Additional Info for Concerts */}
            {entry.entry_type === 'concert' && entry.concert && (
              <div className="space-y-2 text-sm">
                {entry.concert.program && (
                  <div>
                    <strong>Program:</strong>
                    <p className="mt-1 text-muted-foreground whitespace-pre-line">
                      {entry.concert.program}
                    </p>
                  </div>
                )}
                {entry.concert.soloists && (
                  <div>
                    <strong>Soloists:</strong> {entry.concert.soloists}
                  </div>
                )}
                {entry.concert.price_range && (
                  <div>
                    <strong>Price Range:</strong> {entry.concert.price_range}
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {(entry.tags || entry.concert?.tags) && (
              <div className="flex flex-wrap gap-2">
                {(entry.tags || entry.concert?.tags || []).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* External Links */}
            {entry.entry_type === 'concert' && entry.concert?.ticket_url && (
              <div className="flex justify-end">
                <Button asChild size="sm" variant="outline" className="gap-1">
                  <a href={entry.concert.ticket_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                    Original Event
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}