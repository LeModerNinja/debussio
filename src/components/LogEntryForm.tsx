import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@/components/ui/dialog";
import { StarRating } from "@/components/StarRating";
import { Filter } from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface LogEntryFormProps {
  type: 'recording' | 'concert';
  onSuccess?: () => void;
}

export const LogEntryForm = ({ type, onSuccess }: LogEntryFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  
  // Form state for recording
  const [recordingData, setRecordingData] = useState({
    composer: '',
    piece: '',
    orchestra: '',
    conductor: '',
    notes: ''
  });

  // Form state for concert
  const [concertData, setConcertData] = useState({
    title: '',
    venue: '',
    date: '',
    orchestra: '',
    conductor: '',
    program: '',
    notes: ''
  });

  const handleRecordingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to log entries.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First, try to find or create the composer
      let composerId = null;
      if (recordingData.composer.trim()) {
        const { data: existingComposer } = await supabase
          .from('composers')
          .select('id')
          .ilike('name', recordingData.composer.trim())
          .single();

        if (existingComposer) {
          composerId = existingComposer.id;
        } else {
          // Create new composer
          const { data: newComposer, error: composerError } = await supabase
            .from('composers')
            .insert({ name: recordingData.composer.trim() })
            .select('id')
            .single();

          if (composerError) throw composerError;
          composerId = newComposer.id;
        }
      }

      // Next, try to find or create the piece
      let pieceId = null;
      if (recordingData.piece.trim() && composerId) {
        const { data: existingPiece } = await supabase
          .from('pieces')
          .select('id')
          .eq('composer_id', composerId)
          .ilike('title', recordingData.piece.trim())
          .single();

        if (existingPiece) {
          pieceId = existingPiece.id;
        } else {
          // Create new piece
          const { data: newPiece, error: pieceError } = await supabase
            .from('pieces')
            .insert({
              title: recordingData.piece.trim(),
              composer_id: composerId
            })
            .select('id')
            .single();

          if (pieceError) throw pieceError;
          pieceId = newPiece.id;
        }
      }

      // Try to find or create the recording
      let recordingId = null;
      if (pieceId) {
        const { data: existingRecording } = await supabase
          .from('recordings')
          .select('id')
          .eq('piece_id', pieceId)
          .eq('conductor', recordingData.conductor.trim() || null)
          .eq('orchestra', recordingData.orchestra.trim() || null)
          .single();

        if (existingRecording) {
          recordingId = existingRecording.id;
        } else {
          // Create new recording
          const { data: newRecording, error: recordingError } = await supabase
            .from('recordings')
            .insert({
              piece_id: pieceId,
              conductor: recordingData.conductor.trim() || null,
              orchestra: recordingData.orchestra.trim() || null
            })
            .select('id')
            .single();

          if (recordingError) throw recordingError;
          recordingId = newRecording.id;
        }
      }

      // Finally, create the user entry
      const { error: entryError } = await supabase
        .from('user_entries')
        .insert({
          user_id: user.id,
          entry_type: 'recording',
          recording_id: recordingId,
          rating: rating || null,
          notes: recordingData.notes.trim() || null
        });

      if (entryError) throw entryError;

      toast({
        title: "Recording Logged!",
        description: "Your recording has been successfully added to your library.",
      });

      // Reset form
      setRecordingData({
        composer: '',
        piece: '',
        orchestra: '',
        conductor: '',
        notes: ''
      });
      setRating(0);
      onSuccess?.();

    } catch (error: any) {
      console.error('Error logging recording:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to log recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConcertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to log entries.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create the concert entry
      const { data: newConcert, error: concertError } = await supabase
        .from('concerts')
        .insert({
          title: concertData.title.trim(),
          venue: concertData.venue.trim(),
          concert_date: concertData.date,
          orchestra: concertData.orchestra.trim() || null,
          conductor: concertData.conductor.trim() || null,
          program: concertData.program.trim() || null,
          location: concertData.venue.trim(), // Using venue as location for now
          source: 'user'
        })
        .select('id')
        .single();

      if (concertError) throw concertError;

      // Create the user entry
      const { error: entryError } = await supabase
        .from('user_entries')
        .insert({
          user_id: user.id,
          entry_type: 'concert',
          concert_id: newConcert.id,
          rating: rating || null,
          notes: concertData.notes.trim() || null
        });

      if (entryError) throw entryError;

      toast({
        title: "Concert Logged!",
        description: "Your concert experience has been successfully added to your library.",
      });

      // Reset form
      setConcertData({
        title: '',
        venue: '',
        date: '',
        orchestra: '',
        conductor: '',
        program: '',
        notes: ''
      });
      setRating(0);
      onSuccess?.();

    } catch (error: any) {
      console.error('Error logging concert:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to log concert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (type === 'recording') {
    return (
      <form onSubmit={handleRecordingSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="composer">Composer</Label>
          <Input
            id="composer"
            placeholder="e.g., Bach, Mozart, Beethoven"
            value={recordingData.composer}
            onChange={(e) => setRecordingData(prev => ({ ...prev, composer: e.target.value }))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="piece">Piece</Label>
          <Input
            id="piece"
            placeholder="e.g., Symphony No. 9, Brandenburg Concerto"
            value={recordingData.piece}
            onChange={(e) => setRecordingData(prev => ({ ...prev, piece: e.target.value }))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="orchestra">Performer/Orchestra</Label>
          <Input
            id="orchestra"
            placeholder="e.g., Berlin Philharmonic, Yo-Yo Ma"
            value={recordingData.orchestra}
            onChange={(e) => setRecordingData(prev => ({ ...prev, orchestra: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="conductor">Conductor</Label>
          <Input
            id="conductor"
            placeholder="e.g., Herbert von Karajan"
            value={recordingData.conductor}
            onChange={(e) => setRecordingData(prev => ({ ...prev, conductor: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Rating</Label>
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Personal Notes</Label>
          <Textarea
            id="notes"
            placeholder="What did you think of this recording?"
            value={recordingData.notes}
            onChange={(e) => setRecordingData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" type="button">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Search
          </Button>
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Recording'}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleConcertSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Concert Title</Label>
        <Input
          id="title"
          placeholder="e.g., Vienna Philharmonic: Beethoven's 9th"
          value={concertData.title}
          onChange={(e) => setConcertData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="venue">Venue</Label>
        <Input
          id="venue"
          placeholder="e.g., Carnegie Hall, Vienna State Opera"
          value={concertData.venue}
          onChange={(e) => setConcertData(prev => ({ ...prev, venue: e.target.value }))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={concertData.date}
          onChange={(e) => setConcertData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="orchestra">Orchestra/Ensemble</Label>
        <Input
          id="orchestra"
          placeholder="e.g., New York Philharmonic"
          value={concertData.orchestra}
          onChange={(e) => setConcertData(prev => ({ ...prev, orchestra: e.target.value }))}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="conductor">Conductor</Label>
        <Input
          id="conductor"
          placeholder="e.g., Gustavo Dudamel"
          value={concertData.conductor}
          onChange={(e) => setConcertData(prev => ({ ...prev, conductor: e.target.value }))}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="program">Program/Pieces Performed</Label>
        <Textarea
          id="program"
          placeholder="List the pieces performed..."
          value={concertData.program}
          onChange={(e) => setConcertData(prev => ({ ...prev, program: e.target.value }))}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Personal Notes</Label>
        <Textarea
          id="notes"
          placeholder="How was the performance? Any memorable moments?"
          value={concertData.notes}
          onChange={(e) => setConcertData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" type="button">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Search
        </Button>
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Concert'}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
        </div>
      </div>
    </form>
  );
};