// Simplified, reusable log entry form
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/StarRating';
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

  return (
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
  );
}