import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarRating } from "@/components/StarRating";
import { MusicSearch } from "@/components/MusicSearch";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Users, 
  Piano, 
  Guitar, 
  Music2, 
  Mic,
  Crown,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

interface MusicSearchResult {
  id: string;
  title: string;
  composer: string;
  type?: string;
  opus?: string;
  catalog?: string;
  key?: string;
  genre?: string;
  disambiguation?: string;
  tags?: string[];
}

interface EnhancedLogEntryFormProps {
  type: 'recording' | 'concert';
  onSuccess?: () => void;
}

// Define piece categories with their specific fields
const pieceCategories = {
  symphonic: {
    label: 'Symphonic',
    icon: Crown,
    description: 'Symphonies, concertos, orchestral works',
    fields: ['conductor', 'orchestra', 'soloist'],
    ratingCategories: ['conductor_rating', 'orchestra_rating', 'soloist_rating', 'interpretation_rating', 'recording_quality_rating', 'acoustics_rating']
  },
  chamber: {
    label: 'Chamber Music',
    icon: Users,
    description: 'String quartets, trios, small ensembles',
    fields: ['ensemble', 'players'],
    ratingCategories: ['orchestra_rating', 'interpretation_rating', 'recording_quality_rating', 'acoustics_rating']
  },
  solo: {
    label: 'Solo',
    icon: Piano,
    description: 'Piano solo, violin solo, etc.',
    fields: ['soloist', 'instrument'],
    ratingCategories: ['soloist_rating', 'interpretation_rating', 'recording_quality_rating', 'acoustics_rating']
  },
  vocal: {
    label: 'Vocal',
    icon: Mic,
    description: 'Opera, art songs, choral works',
    fields: ['conductor', 'orchestra', 'soloist', 'choir'],
    ratingCategories: ['conductor_rating', 'orchestra_rating', 'soloist_rating', 'interpretation_rating', 'recording_quality_rating', 'acoustics_rating']
  },
  jazz: {
    label: 'Jazz',
    icon: Music2,
    description: 'Jazz performances and recordings',
    fields: ['bandLeader', 'players', 'venue'],
    ratingCategories: ['soloist_rating', 'orchestra_rating', 'interpretation_rating', 'recording_quality_rating', 'acoustics_rating']
  },
  contemporary: {
    label: 'Contemporary',
    icon: Guitar,
    description: 'Modern classical, new music',
    fields: ['conductor', 'orchestra', 'soloist'],
    ratingCategories: ['conductor_rating', 'orchestra_rating', 'soloist_rating', 'interpretation_rating', 'recording_quality_rating', 'acoustics_rating']
  }
};

export const EnhancedLogEntryForm = ({ type, onSuccess }: EnhancedLogEntryFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('symphonic');
  
  // Rating categories and their states
  const [activeRatingCategories, setActiveRatingCategories] = useState<string[]>([]);
  const [ratings, setRatings] = useState<{[key: string]: number}>({});

  // Form state - auto-filled from search
  const [selectedPiece, setSelectedPiece] = useState<MusicSearchResult | null>(null);
  const [formData, setFormData] = useState({
    // Basic info (auto-filled)
    title: '',
    composer: '',
    opus: '',
    catalog: '',
    key: '',
    genre: '',
    
    // Performance details (varies by category)
    conductor: '',
    orchestra: '',
    ensemble: '',
    soloist: '',
    players: '',
    instrument: '',
    choir: '',
    bandLeader: '',
    venue: '',
    
    // Additional details
    album: '',
    label: '',
    releaseYear: '',
    notes: ''
  });

  // Concert-specific data
  const [concertData, setConcertData] = useState({
    title: '',
    venue: '',
    date: '',
    program: '',
    notes: ''
  });

  // Rating categories for different entry types
  const ratingCategories = {
    recording: [
      { key: 'conductor_rating', label: 'Conductor', description: 'Leadership and musical direction' },
      { key: 'recording_quality_rating', label: 'Recording Quality', description: 'Sound clarity and production' },
      { key: 'orchestra_rating', label: 'Orchestra/Ensemble', description: 'Group performance and precision' },
      { key: 'soloist_rating', label: 'Soloist', description: 'Individual performer excellence' },
      { key: 'interpretation_rating', label: 'Interpretation', description: 'Artistic vision and expression' },
      { key: 'acoustics_rating', label: 'Acoustics', description: 'Recording space and sound quality' }
    ],
    concert: [
      { key: 'conductor_rating', label: 'Conductor', description: 'Leadership and musical direction' },
      { key: 'orchestra_rating', label: 'Orchestra/Ensemble', description: 'Group performance and precision' },
      { key: 'soloist_rating', label: 'Soloist', description: 'Individual performer excellence' },
      { key: 'interpretation_rating', label: 'Interpretation', description: 'Artistic vision and expression' },
      { key: 'acoustics_rating', label: 'Acoustics', description: 'Venue and sound quality' },
      { key: 'program_rating', label: 'Program', description: 'Selection and variety of pieces' }
    ]
  };

  const handleMusicSearchSelect = (result: MusicSearchResult) => {
    console.log('Selected piece:', result);
    setSelectedPiece(result);
    
    // Auto-fill form data
    setFormData(prev => ({
      ...prev,
      title: result.title,
      composer: result.composer,
      opus: result.opus || '',
      catalog: result.catalog || '',
      key: result.key || '',
      genre: result.genre || ''
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    } catch (error: any) {
      console.error('Error submitting:', error);
      toast.error(error.message || "Failed to save entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingSubmit = async () => {
    // Create/find composer
    let composerId = null;
    if (formData.composer.trim()) {
      const { data: existingComposer } = await supabase
        .from('composers')
        .select('id')
        .ilike('name', formData.composer.trim())
        .maybeSingle();

      if (existingComposer) {
        composerId = existingComposer.id;
      } else {
        const { data: newComposer, error: composerError } = await supabase
          .from('composers')
          .insert({ name: formData.composer.trim() })
          .select('id')
          .single();

        if (composerError) throw composerError;
        composerId = newComposer.id;
      }
    }

    // Create/find piece
    let pieceId = null;
    if (formData.title.trim() && composerId) {
      const { data: existingPiece } = await supabase
        .from('pieces')
        .select('id')
        .eq('composer_id', composerId)
        .ilike('title', formData.title.trim())
        .maybeSingle();

      if (existingPiece) {
        pieceId = existingPiece.id;
      } else {
        const { data: newPiece, error: pieceError } = await supabase
          .from('pieces')
          .insert({
            title: formData.title.trim(),
            composer_id: composerId,
            opus_number: formData.opus || null,
            key_signature: formData.key || null,
            genre: formData.genre || selectedCategory
          })
          .select('id')
          .single();

        if (pieceError) throw pieceError;
        pieceId = newPiece.id;
      }
    }

    // Create/find recording
    let recordingId = null;
    if (pieceId) {
      const { data: existingRecording } = await supabase
        .from('recordings')
        .select('id')
        .eq('piece_id', pieceId)
        .eq('conductor', formData.conductor.trim() || null)
        .eq('orchestra', formData.orchestra.trim() || null)
        .maybeSingle();

      if (existingRecording) {
        recordingId = existingRecording.id;
      } else {
        const { data: newRecording, error: recordingError } = await supabase
          .from('recordings')
          .insert({
            piece_id: pieceId,
            conductor: formData.conductor.trim() || null,
            orchestra: formData.orchestra.trim() || null,
            soloists: formData.soloist.trim() || null,
            album_title: formData.album.trim() || null,
            label: formData.label.trim() || null,
            release_year: formData.releaseYear ? parseInt(formData.releaseYear) : null
          })
          .select('id')
          .single();

        if (recordingError) throw recordingError;
        recordingId = newRecording.id;
      }
    }

    // Create user entry
    const { error: entryError } = await supabase
      .from('user_entries')
      .insert({
        user_id: user.id,
        entry_type: 'recording',
        recording_id: recordingId,
        rating: rating || null,
        conductor_rating: ratings.conductor_rating || null,
        recording_quality_rating: ratings.recording_quality_rating || null,
        orchestra_rating: ratings.orchestra_rating || null,
        soloist_rating: ratings.soloist_rating || null,
        interpretation_rating: ratings.interpretation_rating || null,
        acoustics_rating: ratings.acoustics_rating || null,
        notes: formData.notes.trim() || null,
        tags: [selectedCategory]
      });

    if (entryError) throw entryError;

    toast.success("Recording logged successfully!");
    resetForm();
    onSuccess?.();
  };

  const handleConcertSubmit = async () => {
    // Create concert
    const { data: newConcert, error: concertError } = await supabase
      .from('concerts')
      .insert({
        title: concertData.title.trim() || formData.title.trim(),
        venue: concertData.venue.trim() || formData.venue.trim(),
        concert_date: concertData.date,
        orchestra: formData.orchestra.trim() || null,
        conductor: formData.conductor.trim() || null,
        soloists: formData.soloist.trim() || null,
        program: concertData.program.trim() || null,
        location: concertData.venue.trim() || formData.venue.trim(),
        source: 'user',
        tags: [selectedCategory]
      })
      .select('id')
      .single();

    if (concertError) throw concertError;

    // Create user entry
    const { error: entryError } = await supabase
      .from('user_entries')
      .insert({
        user_id: user.id,
        entry_type: 'concert',
        concert_id: newConcert.id,
        rating: rating || null,
        conductor_rating: ratings.conductor_rating || null,
        orchestra_rating: ratings.orchestra_rating || null,
        soloist_rating: ratings.soloist_rating || null,
        interpretation_rating: ratings.interpretation_rating || null,
        acoustics_rating: ratings.acoustics_rating || null,
        program_rating: ratings.program_rating || null,
        notes: concertData.notes.trim() || formData.notes.trim() || null,
        tags: [selectedCategory]
      });

    if (entryError) throw entryError;

    toast.success("Concert logged successfully!");
    resetForm();
    onSuccess?.();
  };

  const resetForm = () => {
    setSelectedPiece(null);
    setFormData({
      title: '', composer: '', opus: '', catalog: '', key: '', genre: '',
      conductor: '', orchestra: '', ensemble: '', soloist: '', players: '',
      instrument: '', choir: '', bandLeader: '', venue: '',
      album: '', label: '', releaseYear: '', notes: ''
    });
    setConcertData({ title: '', venue: '', date: '', program: '', notes: '' });
    setRating(0);
    setRatings({});
    setActiveRatingCategories([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Music Search */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Search for Piece</Label>
        <MusicSearch
          onSelect={handleMusicSearchSelect}
          placeholder={`Search for a ${type === 'recording' ? 'recording' : 'concert piece'}...`}
          className="w-full"
        />
        {selectedPiece && (
          <div className="mt-2 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Music className="h-4 w-4 text-primary" />
              <span className="font-medium">{selectedPiece.title}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              by {selectedPiece.composer}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedPiece.opus && (
                <Badge variant="outline" className="text-xs">Op. {selectedPiece.opus}</Badge>
              )}
              {selectedPiece.catalog && (
                <Badge variant="outline" className="text-xs">{selectedPiece.catalog}</Badge>
              )}
              {selectedPiece.key && (
                <Badge variant="outline" className="text-xs">{selectedPiece.key}</Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Piece Category</Label>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full h-auto">
            {Object.entries(pieceCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1 text-xs px-2 py-2">
                  <IconComponent className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">{category.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(pieceCategories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>

              {/* Dynamic fields based on category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic info (auto-filled but editable) */}
                <div className="space-y-2">
                  <Label htmlFor="composer">Composer</Label>
                  <Input
                    id="composer"
                    value={formData.composer}
                    onChange={(e) => handleInputChange('composer', e.target.value)}
                    placeholder="e.g., Bach, Mozart"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Piece Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Symphony No. 9"
                    required
                  />
                </div>

                {formData.opus && (
                  <div className="space-y-2">
                    <Label htmlFor="opus">Opus/Number</Label>
                    <Input
                      id="opus"
                      value={formData.opus}
                      onChange={(e) => handleInputChange('opus', e.target.value)}
                      placeholder="e.g., Op. 67"
                    />
                  </div>
                )}

                {formData.catalog && (
                  <div className="space-y-2">
                    <Label htmlFor="catalog">Catalog Number</Label>
                    <Input
                      id="catalog"
                      value={formData.catalog}
                      onChange={(e) => handleInputChange('catalog', e.target.value)}
                      placeholder="e.g., BWV 1007"
                    />
                  </div>
                )}

                {formData.key && (
                  <div className="space-y-2">
                    <Label htmlFor="key">Key</Label>
                    <Input
                      id="key"
                      value={formData.key}
                      onChange={(e) => handleInputChange('key', e.target.value)}
                      placeholder="e.g., C major"
                    />
                  </div>
                )}

                {/* Category-specific fields */}
                {category.fields.includes('conductor') && (
                  <div className="space-y-2">
                    <Label htmlFor="conductor">Conductor</Label>
                    <Input
                      id="conductor"
                      value={formData.conductor}
                      onChange={(e) => handleInputChange('conductor', e.target.value)}
                      placeholder="e.g., Herbert von Karajan"
                    />
                  </div>
                )}

                {category.fields.includes('orchestra') && (
                  <div className="space-y-2">
                    <Label htmlFor="orchestra">Orchestra</Label>
                    <Input
                      id="orchestra"
                      value={formData.orchestra}
                      onChange={(e) => handleInputChange('orchestra', e.target.value)}
                      placeholder="e.g., Berlin Philharmonic"
                    />
                  </div>
                )}

                {category.fields.includes('ensemble') && (
                  <div className="space-y-2">
                    <Label htmlFor="ensemble">Ensemble</Label>
                    <Input
                      id="ensemble"
                      value={formData.ensemble}
                      onChange={(e) => handleInputChange('ensemble', e.target.value)}
                      placeholder="e.g., Emerson String Quartet"
                    />
                  </div>
                )}

                {category.fields.includes('soloist') && (
                  <div className="space-y-2">
                    <Label htmlFor="soloist">Soloist(s)</Label>
                    <Input
                      id="soloist"
                      value={formData.soloist}
                      onChange={(e) => handleInputChange('soloist', e.target.value)}
                      placeholder="e.g., Yo-Yo Ma, Martha Argerich"
                    />
                  </div>
                )}

                {category.fields.includes('players') && (
                  <div className="space-y-2">
                    <Label htmlFor="players">Players</Label>
                    <Input
                      id="players"
                      value={formData.players}
                      onChange={(e) => handleInputChange('players', e.target.value)}
                      placeholder="e.g., John Doe (piano), Jane Smith (violin)"
                    />
                  </div>
                )}

                {category.fields.includes('instrument') && (
                  <div className="space-y-2">
                    <Label htmlFor="instrument">Instrument</Label>
                    <Input
                      id="instrument"
                      value={formData.instrument}
                      onChange={(e) => handleInputChange('instrument', e.target.value)}
                      placeholder="e.g., Piano, Violin"
                    />
                  </div>
                )}

                {category.fields.includes('choir') && (
                  <div className="space-y-2">
                    <Label htmlFor="choir">Choir</Label>
                    <Input
                      id="choir"
                      value={formData.choir}
                      onChange={(e) => handleInputChange('choir', e.target.value)}
                      placeholder="e.g., Vienna State Opera Chorus"
                    />
                  </div>
                )}

                {category.fields.includes('bandLeader') && (
                  <div className="space-y-2">
                    <Label htmlFor="bandLeader">Band Leader</Label>
                    <Input
                      id="bandLeader"
                      value={formData.bandLeader}
                      onChange={(e) => handleInputChange('bandLeader', e.target.value)}
                      placeholder="e.g., Miles Davis"
                    />
                  </div>
                )}

                {category.fields.includes('venue') && (
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                      placeholder="e.g., Carnegie Hall"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Recording-specific fields */}
      {type === 'recording' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="album">Album Title</Label>
            <Input
              id="album"
              value={formData.album}
              onChange={(e) => handleInputChange('album', e.target.value)}
              placeholder="e.g., The Complete Symphonies"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder="e.g., Deutsche Grammophon"
            />
          </div>
        </div>
      )}

      {/* Concert-specific fields */}
      {type === 'concert' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="concertVenue">Venue</Label>
              <Input
                id="concertVenue"
                value={concertData.venue}
                onChange={(e) => setConcertData(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="e.g., Carnegie Hall"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="concertDate">Date</Label>
              <Input
                id="concertDate"
                type="date"
                value={concertData.date}
                onChange={(e) => setConcertData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <Textarea
              id="program"
              value={concertData.program}
              onChange={(e) => setConcertData(prev => ({ ...prev, program: e.target.value }))}
              placeholder="List the pieces performed..."
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Ratings Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">Overall Rating</Label>
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>

        {/* Rating Category Buttons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Additional Ratings (Optional)</Label>
          <div className="flex flex-wrap gap-2">
            {ratingCategories[type].map((category) => (
              <Button
                key={category.key}
                type="button"
                variant={activeRatingCategories.includes(category.key) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (activeRatingCategories.includes(category.key)) {
                    setActiveRatingCategories(prev => prev.filter(c => c !== category.key));
                    setRatings(prev => {
                      const newRatings = { ...prev };
                      delete newRatings[category.key];
                      return newRatings;
                    });
                  } else {
                    setActiveRatingCategories(prev => [...prev, category.key]);
                  }
                }}
                className="text-xs"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Rating Categories */}
        {activeRatingCategories.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            {activeRatingCategories.map((categoryKey) => {
              const category = ratingCategories[type].find(c => c.key === categoryKey);
              if (!category) return null;
              
              return (
                <div key={categoryKey} className="space-y-2">
                  <Label className="text-sm font-medium">{category.label}</Label>
                  <StarRating 
                    rating={ratings[categoryKey] || 0} 
                    onRatingChange={(newRating) => setRatings(prev => ({ ...prev, [categoryKey]: newRating }))}
                    size="sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Personal Notes</Label>
        <Textarea
          id="notes"
          placeholder={`What did you think of this ${type}?`}
          value={type === 'recording' ? formData.notes : concertData.notes}
          onChange={(e) => {
            if (type === 'recording') {
              handleInputChange('notes', e.target.value);
            } else {
              setConcertData(prev => ({ ...prev, notes: e.target.value }));
            }
          }}
          rows={3}
        />
      </div>

      {/* Submit buttons */}
      <div className="flex justify-end gap-4">
        <DialogClose asChild>
          <Button variant="outline" type="button">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : `Save ${type === 'recording' ? 'Recording' : 'Concert'}`}
        </Button>
      </div>
    </form>
  );
};