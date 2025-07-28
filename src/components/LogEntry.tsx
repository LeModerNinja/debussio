import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { musicBrainzService, type MusicBrainzRecording } from '@/services/musicBrainzService';
import { albumArtService, type AlbumArtResult } from '@/services/albumArtService';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { X, Search, Music, Calendar, Loader2, ExternalLink, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { StarRating } from '@/components/StarRating';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface LogEntryForm {
  title: string;
  composer: string;
  conductor?: string;
  orchestra?: string;
  soloists?: string;
  venue?: string;
  location?: string;
  concertDate?: string;
  startTime?: string;
  program?: string;
  rating: number;
  notes: string;
  tags: string;
}

interface DetailedRatings {
  recordingQuality: number;
  soloistPerformance: number;
  conductorPerformance: number;
  orchestraPerformance: number;
  interpretation: number;
  acoustics: number;
}

interface LogEntryProps {
  type: 'recording' | 'concert';
  onClose: () => void;
}

interface MusicBrainzSearchResult {
  id: string;
  title: string;
  artists: string[];
  releaseTitle?: string;
  releaseDate?: string;
  label?: string;
  duration?: number;
  releaseId?: string; // For fetching album art
}

export function LogEntry({ type, onClose }: LogEntryProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMusicBrainzSearch, setShowMusicBrainzSearch] = useState(false);
  const [musicBrainzResults, setMusicBrainzResults] = useState<MusicBrainzSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecording, setSelectedRecording] = useState<MusicBrainzSearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<MusicBrainzSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [albumArt, setAlbumArt] = useState<AlbumArtResult | null>(null);
  const [loadingAlbumArt, setLoadingAlbumArt] = useState(false);
  const [showDetailedRatings, setShowDetailedRatings] = useState(false);
  const [detailedRatings, setDetailedRatings] = useState<DetailedRatings>({
    recordingQuality: 3,
    soloistPerformance: 3,
    conductorPerformance: 3,
    orchestraPerformance: 3,
    interpretation: 3,
    acoustics: 3,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LogEntryForm>({
    defaultValues: {
      rating: 3,
      tags: '',
    },
  });

  // Clean up MusicBrainz data by filtering out unwanted results
  const cleanMusicBrainzResults = (recordings: any[]): MusicBrainzSearchResult[] => {
    return recordings
      .filter(recording => {
        // Filter out results that are clearly not classical music
        const title = recording.title?.toLowerCase() || '';
        const artists = recording['artist-credit']?.map((ac: any) => ac.name?.toLowerCase()).join(' ') || '';
        
        // Skip if it contains electronic music indicators
        const electronicKeywords = ['remix', 'mix', 'dj', 'club', 'dance', 'techno', 'house', 'ambient'];
        const hasElectronicKeywords = electronicKeywords.some(keyword => 
          title.includes(keyword) || artists.includes(keyword)
        );
        
        // Skip if it's too short (likely not classical)
        const duration = recording.length;
        const isTooShort = duration && duration < 30000; // Less than 30 seconds
        
        // Skip if it has certain non-classical release types
        const releases = recording.releases || [];
        const hasNonClassicalRelease = releases.some((release: any) => {
          const releaseTitle = release.title?.toLowerCase() || '';
          return releaseTitle.includes('compilation') || 
                 releaseTitle.includes('mix') ||
                 releaseTitle.includes('soundtrack');
        });
        
        return !hasElectronicKeywords && !isTooShort && !hasNonClassicalRelease;
      })
      .slice(0, 10) // Limit to top 10 results
      .map(recording => {
        const extractedInfo = musicBrainzService.extractRecordingInfo(recording);
        return {
          id: extractedInfo.id,
          title: extractedInfo.title,
          artists: extractedInfo.artists,
          releaseTitle: extractedInfo.releaseTitle,
          releaseDate: extractedInfo.releaseDate,
          label: extractedInfo.label,
          duration: extractedInfo.duration,
          releaseId: extractedInfo.releaseId,
        };
      });
  };

  // Debounced search for suggestions
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      
      try {
        const results = await musicBrainzService.searchRecordings(query, undefined, 8);
        const cleanedResults = cleanMusicBrainzResults(results.recordings || []);
        setSuggestions(cleanedResults.slice(0, 5)); // Show top 5 suggestions
        setShowSuggestions(true);
      } catch (error) {
        console.error('Suggestion search error:', error);
      }
    },
    []
  );

  // Effect for debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (type === 'recording') {
        debouncedSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch, type]);

  // Search MusicBrainz for recordings
  const searchMusicBrainz = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    setShowSuggestions(false);
    try {
      const results = await musicBrainzService.searchRecordings(searchQuery);
      const cleanedResults = cleanMusicBrainzResults(results.recordings || []);
      
      setMusicBrainzResults(cleanedResults);
      setShowMusicBrainzSearch(true);
    } catch (error) {
      console.error('MusicBrainz search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search MusicBrainz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Fetch album art for selected recording
  const fetchAlbumArt = useCallback(async (recording: MusicBrainzSearchResult) => {
    setLoadingAlbumArt(true);
    try {
      const artResult = await albumArtService.searchAlbumArt(
        recording.releaseTitle || recording.title,
        recording.artists[0],
        recording.releaseId // This will be added to the interface
      );
      setAlbumArt(artResult);
    } catch (error) {
      console.error('Error fetching album art:', error);
    } finally {
      setLoadingAlbumArt(false);
    }
  }, []);

  // Select a recording from MusicBrainz results
  const selectRecording = (recording: MusicBrainzSearchResult) => {
    setSelectedRecording(recording);
    setValue('title', recording.title);
    setValue('composer', recording.artists[0] || '');
    setValue('orchestra', recording.releaseTitle || '');
    setSearchQuery(recording.title);
    setShowMusicBrainzSearch(false);
    setShowSuggestions(false);
    
    // Fetch album art for this recording
    fetchAlbumArt(recording);
    
    toast({
      title: "Recording Selected",
      description: `Added "${recording.title}" by ${recording.artists[0]}`,
    });
  };

  const onSubmit = async (data: LogEntryForm) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to log entries.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the entry record
      const entryData = {
        user_id: user.id,
        entry_type: type,
        entry_date: type === 'concert' ? data.concertDate || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        rating: data.rating,
        notes: data.notes,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : null,
      };

      const { data: entry, error: entryError } = await supabase
        .from('user_entries')
        .insert(entryData)
        .select()
        .single();

      if (entryError) throw entryError;

      // For recordings, also create/link recording data
      if (type === 'recording') {
        // First, check if we need to create a composer
        let composerId = null;
        if (data.composer) {
          const { data: existingComposer } = await supabase
            .from('composers')
            .select('id')
            .eq('name', data.composer)
            .single();

          if (existingComposer) {
            composerId = existingComposer.id;
          } else {
            const { data: newComposer, error: composerError } = await supabase
              .from('composers')
              .insert({ name: data.composer })
              .select()
              .single();

            if (composerError) throw composerError;
            composerId = newComposer.id;
          }
        }

        // Then create/link piece
        let pieceId = null;
        if (data.title && composerId) {
          const { data: existingPiece } = await supabase
            .from('pieces')
            .select('id')
            .eq('title', data.title)
            .eq('composer_id', composerId)
            .single();

          if (existingPiece) {
            pieceId = existingPiece.id;
          } else {
            const { data: newPiece, error: pieceError } = await supabase
              .from('pieces')
              .insert({
                title: data.title,
                composer_id: composerId,
              })
              .select()
              .single();

            if (pieceError) throw pieceError;
            pieceId = newPiece.id;
          }
        }

        // Finally create recording
        if (pieceId) {
            const recordingData = {
              piece_id: pieceId,
              conductor: data.conductor || null,
              orchestra: data.orchestra || null,
              soloists: data.soloists || null,
              musicbrainz_id: selectedRecording?.id || null,
              cover_art_sources: albumArt ? {
                [albumArt.source]: albumArt.url
              } : {},
            };

          const { data: recording, error: recordingError } = await supabase
            .from('recordings')
            .insert(recordingData)
            .select()
            .single();

          if (recordingError) throw recordingError;

          // Update entry with recording_id
          await supabase
            .from('user_entries')
            .update({ recording_id: recording.id })
            .eq('id', entry.id);
        }
      }

      // For concerts, create/link concert data
      if (type === 'concert') {
        const concertData = {
          title: data.title,
          venue: data.venue || 'Unknown Venue',
          location: data.location || 'Unknown Location',
          concert_date: data.concertDate || new Date().toISOString().split('T')[0],
          start_time: data.startTime || null,
          orchestra: data.orchestra || null,
          conductor: data.conductor || null,
          soloists: data.soloists || null,
          program: data.program || null,
        };

        const { data: concert, error: concertError } = await supabase
          .from('concerts')
          .insert(concertData)
          .select()
          .single();

        if (concertError) throw concertError;

        // Update entry with concert_id
        await supabase
          .from('user_entries')
          .update({ concert_id: concert.id })
          .eq('id', entry.id);
      }

      toast({
        title: "Success!",
        description: `${type === 'recording' ? 'Recording' : 'Concert'} logged successfully.`,
      });

      onClose();
    } catch (error) {
      console.error('Error creating entry:', error);
      toast({
        title: "Error",
        description: `Failed to log ${type}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {type === 'recording' ? (
                <Music className="h-5 w-5 text-primary" />
              ) : (
                <Calendar className="h-5 w-5 text-primary" />
              )}
              <CardTitle>
                Log {type === 'recording' ? 'Recording' : 'Concert'}
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {type === 'recording' 
              ? 'Add a classical recording to your library with rich metadata from MusicBrainz'
              : 'Log a concert experience with details about the performance'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* MusicBrainz Search for Recordings */}
          {type === 'recording' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Label htmlFor="search">Search MusicBrainz Database</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="flex-1 relative">
                      <Input
                        id="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Start typing composer, piece title, or performer..."
                        onKeyDown={(e) => e.key === 'Enter' && searchMusicBrainz()}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      />
                      
                      {/* Search Suggestions Dropdown */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                          {suggestions.map((suggestion) => (
                            <div
                              key={suggestion.id}
                              className="p-3 hover:bg-muted cursor-pointer border-b border-border/50 last:border-b-0"
                              onClick={() => selectRecording(suggestion)}
                            >
                              <div className="font-medium text-sm">{suggestion.title}</div>
                              <div className="text-xs text-muted-foreground">
                                by {suggestion.artists.join(', ')}
                              </div>
                              {suggestion.releaseTitle && (
                                <div className="text-xs text-muted-foreground">
                                  {suggestion.releaseTitle}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button 
                      type="button" 
                      onClick={searchMusicBrainz}
                      disabled={searchLoading || !searchQuery.trim()}
                      className="gap-2"
                    >
                      {searchLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      Search
                    </Button>
                  </div>
                </div>
              </div>

              {/* Selected Recording Display */}
              {selectedRecording && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {/* Album Art */}
                    <div className="flex-shrink-0">
                      {loadingAlbumArt ? (
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : albumArt ? (
                        <div className="relative group">
                          <img 
                            src={albumArt.url} 
                            alt="Album cover"
                            className="w-20 h-20 object-cover rounded-md border"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md flex items-center justify-center">
                            <Badge 
                              variant="secondary" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            >
                              {albumArt.source}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                          <Music className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Recording Info */}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-muted-foreground">Selected from MusicBrainz:</h4>
                      <p className="font-semibold">{selectedRecording.title}</p>
                      <p className="text-sm text-muted-foreground">
                        by {selectedRecording.artists.join(', ')}
                      </p>
                      {selectedRecording.releaseTitle && (
                        <p className="text-sm text-muted-foreground">
                          Album: {selectedRecording.releaseTitle}
                        </p>
                      )}
                    </div>
                    
                    <Badge variant="secondary" className="gap-1 self-start">
                      <ExternalLink className="h-3 w-3" />
                      MusicBrainz
                    </Badge>
                  </div>
                </div>
              )}

              {/* MusicBrainz Search Results */}
              {showMusicBrainzSearch && musicBrainzResults.length > 0 && (
                <div className="border rounded-lg p-4 bg-background">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">MusicBrainz Results</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowMusicBrainzSearch(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {musicBrainzResults.map((recording) => (
                      <div
                        key={recording.id}
                        className="p-3 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => selectRecording(recording)}
                      >
                        <div className="font-medium">{recording.title}</div>
                        <div className="text-sm text-muted-foreground">
                          by {recording.artists.join(', ')}
                        </div>
                        {recording.releaseTitle && (
                          <div className="text-xs text-muted-foreground">
                            {recording.releaseTitle}
                            {recording.releaseDate && ` (${recording.releaseDate.split('-')[0]})`}
                            {recording.label && ` • ${recording.label}`}
                          </div>
                        )}
                        {recording.duration && (
                          <div className="text-xs text-muted-foreground">
                            Duration: {recording.duration} minutes
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  placeholder={type === 'recording' ? 'Symphony No. 9' : 'Berlin Philharmonic Concert'}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="composer">Composer *</Label>
                <Input
                  id="composer"
                  {...register('composer', { required: 'Composer is required' })}
                  placeholder="Ludwig van Beethoven"
                  className={errors.composer ? 'border-red-500' : ''}
                />
                {errors.composer && (
                  <p className="text-red-500 text-sm mt-1">{errors.composer.message}</p>
                )}
              </div>
            </div>

            {/* Type-specific fields */}
            {type === 'recording' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="conductor">Conductor</Label>
                  <Input
                    id="conductor"
                    {...register('conductor')}
                    placeholder="Leonard Bernstein"
                  />
                </div>
                <div>
                  <Label htmlFor="orchestra">Orchestra/Ensemble</Label>
                  <Input
                    id="orchestra"
                    {...register('orchestra')}
                    placeholder="New York Philharmonic"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="soloists">Soloists</Label>
                  <Input
                    id="soloists"
                    {...register('soloists')}
                    placeholder="Yo-Yo Ma, Emanuel Ax"
                  />
                </div>
              </div>
            )}

            {type === 'concert' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venue">Venue *</Label>
                    <Input
                      id="venue"
                      {...register('venue', { required: type === 'concert' })}
                      placeholder="Carnegie Hall"
                      className={errors.venue ? 'border-red-500' : ''}
                    />
                    {errors.venue && (
                      <p className="text-red-500 text-sm mt-1">Venue is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      {...register('location', { required: type === 'concert' })}
                      placeholder="New York, NY"
                      className={errors.location ? 'border-red-500' : ''}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">Location is required</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="concertDate">Concert Date</Label>
                    <Input
                      id="concertDate"
                      type="date"
                      {...register('concertDate')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      {...register('startTime')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="conductor">Conductor</Label>
                    <Input
                      id="conductor"
                      {...register('conductor')}
                      placeholder="Leonard Bernstein"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orchestra">Orchestra/Ensemble</Label>
                    <Input
                      id="orchestra"
                      {...register('orchestra')}
                      placeholder="New York Philharmonic"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="soloists">Soloists</Label>
                  <Input
                    id="soloists"
                    {...register('soloists')}
                    placeholder="Yo-Yo Ma, Emanuel Ax"
                  />
                </div>

                <div>
                  <Label htmlFor="program">Program</Label>
                  <Textarea
                    id="program"
                    {...register('program')}
                    placeholder="List the pieces performed in the concert..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Rating */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="rating">Overall Rating</Label>
                <div className="mt-2">
                  <StarRating 
                    rating={watch('rating')} 
                    onRatingChange={(rating) => setValue('rating', rating)}
                    size="lg"
                  />
                </div>
              </div>

              {/* Detailed Ratings Toggle */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailedRatings(!showDetailedRatings)}
                  className="gap-2"
                >
                  {showDetailedRatings ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Detailed Ratings (Optional)
                </Button>
              </div>

              {/* Detailed Ratings Section */}
              {showDetailedRatings && (
                <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                  <h4 className="font-medium text-sm text-muted-foreground">Rate specific aspects:</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recording Quality (only for recordings) */}
                    {type === 'recording' && (
                      <div>
                        <Label className="text-sm">Recording Quality</Label>
                        <StarRating 
                          rating={detailedRatings.recordingQuality}
                          onRatingChange={(rating) => setDetailedRatings(prev => ({ ...prev, recordingQuality: rating }))}
                          size="sm"
                        />
                      </div>
                    )}

                    {/* Acoustics (only for concerts) */}
                    {type === 'concert' && (
                      <div>
                        <Label className="text-sm">Venue Acoustics</Label>
                        <StarRating 
                          rating={detailedRatings.acoustics}
                          onRatingChange={(rating) => setDetailedRatings(prev => ({ ...prev, acoustics: rating }))}
                          size="sm"
                        />
                      </div>
                    )}

                    {/* Soloist Performance */}
                    <div>
                      <Label className="text-sm">Soloist Performance</Label>
                      <StarRating 
                        rating={detailedRatings.soloistPerformance}
                        onRatingChange={(rating) => setDetailedRatings(prev => ({ ...prev, soloistPerformance: rating }))}
                        size="sm"
                      />
                    </div>

                    {/* Conductor Performance */}
                    <div>
                      <Label className="text-sm">Conductor Performance</Label>
                      <StarRating 
                        rating={detailedRatings.conductorPerformance}
                        onRatingChange={(rating) => setDetailedRatings(prev => ({ ...prev, conductorPerformance: rating }))}
                        size="sm"
                      />
                    </div>

                    {/* Orchestra Performance */}
                    <div>
                      <Label className="text-sm">Orchestra Performance</Label>
                      <StarRating 
                        rating={detailedRatings.orchestraPerformance}
                        onRatingChange={(rating) => setDetailedRatings(prev => ({ ...prev, orchestraPerformance: rating }))}
                        size="sm"
                      />
                    </div>

                    {/* Interpretation */}
                    <div>
                      <Label className="text-sm">Musical Interpretation</Label>
                      <StarRating 
                        rating={detailedRatings.interpretation}
                        onRatingChange={(rating) => setDetailedRatings(prev => ({ ...prev, interpretation: rating }))}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Share your thoughts about this performance..."
                rows={3}
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="romantic, powerful, emotional"
              />
            </div>

            {/* Submit buttons */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Saving...' : `Log ${type}`}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}