// Enhanced log entry form with MusicBrainz search integration
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Music, User, ExternalLink, Plus, X, Loader2 } from 'lucide-react';
import { musicBrainzService } from '@/services/musicBrainzService';
import { toast } from 'sonner';
import type { FormData } from '@/types';
import { RATING_CATEGORIES } from '@/constants';

interface LogEntryFormProps {
  type: 'recording' | 'concert';
  onSuccess?: () => void;
}

export function LogEntryForm({ type, onSuccess }: LogEntryFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showMusicBrainzSearch, setShowMusicBrainzSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'works' | 'recordings'>('works');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    composer: '',
    conductor: '',
    orchestra: '',
    soloists: '',
    venue: '',
    location: '',
    concertDate: '',
    startTime: '',
    program: '',
    rating: 0,
    notes: '',
    tags: ''
  });

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // MusicBrainz search functionality
  const handleMusicBrainzSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setSearchLoading(true);
    try {
      let response;
      
      if (searchType === 'works') {
        response = await musicBrainzService.searchWorks(searchQuery);
        if (response.works) {
          const extractedResults = response.works.map(work => 
            musicBrainzService.extractWorkInfo(work)
          );
          setSearchResults(extractedResults);
        }
      } else {
        response = await musicBrainzService.searchRecordings(searchQuery);
        if (response.recordings) {
          const extractedResults = response.recordings.map(recording => 
            musicBrainzService.extractRecordingInfo(recording)
          );
          setSearchResults(extractedResults);
        }
      }
      
      if ((!response.works && !response.recordings) || (response.works?.length === 0 && response.recordings?.length === 0)) {
        toast.info('No results found. Try a different search term.');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('MusicBrainz search error:', error);
      toast.error('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Function to populate form with selected MusicBrainz result
  const selectMusicBrainzResult = (result: any) => {
    setFormData(prev => ({
      ...prev,
      title: result.title || prev.title,
      composer: result.composer || prev.composer,
      ...(type === 'recording' && result.artists && result.artists.length > 0 && { 
        orchestra: result.artists[0] || prev.orchestra 
      }),
      ...(result.releaseTitle && { 
        // For recordings, we might want to add album info to notes or tags
        notes: prev.notes ? `${prev.notes}\nAlbum: ${result.releaseTitle}` : `Album: ${result.releaseTitle}`
      })
    }));
    setShowMusicBrainzSearch(false);
    setSearchResults([]);
    setSearchQuery('');
    toast.success('Information imported from MusicBrainz');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to log entries.");
      return;
    }

    setLoading(true);
    try {
      if (type === 'recording') {
        await handleRecordingSubmit();
      } else {
        await handleConcertSubmit();
      }
      toast.success(`${type} logged successfully!`);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting:', error);
      toast.error(error.message || "Failed to save entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingSubmit = async () => {
    // Simplified recording creation logic
    const { data: composer } = await supabase
      .from('composers')
      .upsert({ name: formData.composer }, { onConflict: 'name' })
      .select('id')
      .single();

    const { data: piece } = await supabase
      .from('pieces')
      .upsert({
        title: formData.title,
        composer_id: composer.id
      }, { onConflict: 'title,composer_id' })
      .select('id')
      .single();

    const { data: recording } = await supabase
      .from('recordings')
      .upsert({
        piece_id: piece.id,
        conductor: formData.conductor || null,
        orchestra: formData.orchestra || null,
        soloists: formData.soloists || null
      })
      .select('id')
      .single();

    await supabase
      .from('user_entries')
      .insert({
        user_id: user.id,
        entry_type: 'recording',
        recording_id: recording.id,
        rating: formData.rating || null,
        notes: formData.notes || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : null
      });
  };

  const handleConcertSubmit = async () => {
    const { data: concert } = await supabase
      .from('concerts')
      .insert({
        title: formData.title,
        venue: formData.venue || 'Unknown Venue',
        location: formData.location || 'Unknown Location',
        concert_date: formData.concertDate || new Date().toISOString().split('T')[0],
        start_time: formData.startTime || null,
        orchestra: formData.orchestra || null,
        conductor: formData.conductor || null,
        soloists: formData.soloists || null,
        program: formData.program || null,
        source: 'user'
      })
      .select('id')
      .single();

    await supabase
      .from('user_entries')
      .insert({
        user_id: user.id,
        entry_type: 'concert',
        concert_id: concert.id,
        rating: formData.rating || null,
        notes: formData.notes || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : null
      });
  };

  const MusicBrainzSearchDialog = () => (
    <Dialog open={showMusicBrainzSearch} onOpenChange={setShowMusicBrainzSearch}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search MusicBrainz Database
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowMusicBrainzSearch(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Search the comprehensive MusicBrainz database to find classical music works and recordings. Click on any result to auto-fill your form.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <Tabs value={searchType} onValueChange={(value) => setSearchType(value as 'works' | 'recordings')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="works">Musical Works</TabsTrigger>
              <TabsTrigger value="recordings">Recordings</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchType === 'works' ? 'Search symphonies, concertos, sonatas...' : 'Search recordings, albums...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !searchLoading && handleMusicBrainzSearch()}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button 
              onClick={handleMusicBrainzSearch} 
              disabled={searchLoading || !searchQuery.trim()}
              className="min-w-[100px]"
            >
              {searchLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>

          {/* Search Results */}
          <div className="flex-1 min-h-0">
            {searchLoading ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching MusicBrainz database...
                </div>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-96">
                <p className="text-sm text-muted-foreground">
                  Found {searchResults.length} results. Click any result to import the information.
                </p>
                {searchResults.map((result) => (
                  <Card 
                    key={result.id} 
                    className="hover:shadow-md hover:bg-accent/50 transition-all cursor-pointer border-2 hover:border-primary/20" 
                    onClick={() => selectMusicBrainzResult(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg mb-1">{result.title}</h4>
                          {result.disambiguation && (
                            <p className="text-sm text-muted-foreground mb-2">{result.disambiguation}</p>
                          )}
                          
                          <div className="space-y-1">
                            {result.composer && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{result.composer}</span>
                              </div>
                            )}
                            
                            {result.artists && result.artists.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Music className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{result.artists.join(', ')}</span>
                              </div>
                            )}

                            {result.releaseTitle && (
                              <div className="text-sm text-muted-foreground">
                                <strong>Album:</strong> {result.releaseTitle}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {result.type && (
                              <Badge variant="secondary" className="text-xs">{result.type}</Badge>
                            )}
                            {result.opusNumber && (
                              <Badge variant="outline" className="text-xs">Op. {result.opusNumber}</Badge>
                            )}
                            {result.keySignature && (
                              <Badge variant="outline" className="text-xs">{result.keySignature}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchQuery && !searchLoading ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No results found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try searching with different terms like composer names, work titles, or keywords.
                  </p>
                  <Button variant="outline" onClick={clearSearch} size="sm">
                    Clear search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Search MusicBrainz</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a composer name, work title, or keywords to search the database.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* MusicBrainz Search Integration */}
      <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-primary" />
            MusicBrainz Search
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Search the comprehensive MusicBrainz database to automatically populate work information. Click the button below to get started.
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            variant="default" 
            className="w-full gap-2" 
            onClick={() => setShowMusicBrainzSearch(true)}
          >
            <Search className="h-4 w-4" />
            Search MusicBrainz Database
          </Button>
        </CardContent>
      </Card>

      <MusicBrainzSearchDialog />

      {/* Manual Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {type === 'recording' ? 'Recording Details' : 'Concert Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder={type === 'recording' ? 'Symphony No. 9' : 'Concert Title'}
                  required
                />
              </div>
              <div>
                <Label>Composer *</Label>
                <Input
                  value={formData.composer}
                  onChange={(e) => updateField('composer', e.target.value)}
                  placeholder="Ludwig van Beethoven"
                  required
                />
              </div>
            </div>

      {type === 'concert' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Venue *</Label>
            <Input
              value={formData.venue}
              onChange={(e) => updateField('venue', e.target.value)}
              placeholder="Carnegie Hall"
              required
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={formData.concertDate}
              onChange={(e) => updateField('concertDate', e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Conductor</Label>
          <Input
            value={formData.conductor}
            onChange={(e) => updateField('conductor', e.target.value)}
            placeholder="Leonard Bernstein"
          />
        </div>
        <div>
          <Label>Orchestra</Label>
          <Input
            value={formData.orchestra}
            onChange={(e) => updateField('orchestra', e.target.value)}
            placeholder="New York Philharmonic"
          />
        </div>
      </div>

      <div>
        <Label>Rating</Label>
        <StarRating 
          rating={formData.rating} 
          onRatingChange={(rating) => updateField('rating', rating)}
        />
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Your thoughts..."
          rows={3}
        />
      </div>

            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : `Save ${type}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}