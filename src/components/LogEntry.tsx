import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Star, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface LogEntryProps {
  type: 'recording' | 'concert';
  onClose: () => void;
}

// Form data interface for type safety
interface LogEntryForm {
  composer: string;
  piece: string;
  conductor?: string;
  orchestra?: string;
  label?: string;
  year?: number;
  venue?: string;
  notes?: string;
}

export const LogEntry = ({ type, onClose }: LogEntryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LogEntryForm>();

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Function to handle form submission and save entry to database
  const onSubmit = async (data: LogEntryForm) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save entries.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // For concerts, validate that date is selected
      if (type === 'concert' && !date) {
        toast({
          title: "Error", 
          description: "Please select a concert date.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Create the user entry record
      // For now, we'll store basic info in notes until we implement full composer/piece lookup
      const formattedNotes = `${data.composer} - ${data.piece}\n` +
        (data.conductor ? `Conductor: ${data.conductor}\n` : '') +
        (data.orchestra ? `Orchestra: ${data.orchestra}\n` : '') +
        (type === 'recording' && data.label ? `Label: ${data.label}\n` : '') +
        (type === 'recording' && data.year ? `Year: ${data.year}\n` : '') +
        (type === 'concert' && data.venue ? `Venue: ${data.venue}\n` : '') +
        (data.notes ? `\nNotes: ${data.notes}` : '');

      const entryData = {
        user_id: user.id,
        entry_type: type,
        notes: formattedNotes,
        rating: rating > 0 ? rating : null,
        tags: tags.length > 0 ? tags : null,
        entry_date: format(date || new Date(), 'yyyy-MM-dd')
      };

      const { error } = await supabase
        .from('user_entries')
        .insert(entryData);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${type === 'recording' ? 'Recording' : 'Concert'} entry saved to your library.`
      });

      // Reset form and close
      reset();
      setRating(0);
      setTags([]);
      setDate(undefined);
      onClose();
      
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={cn(
          "h-5 w-5 cursor-pointer transition-colors",
          i < rating ? "fill-accent text-accent" : "text-muted-foreground hover:text-accent"
        )}
        onClick={() => setRating(i + 1)}
      />
    ));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Log {type === 'recording' ? 'Recording' : 'Concert'}</CardTitle>
            <CardDescription>
              Add a new {type} to your classical music journey
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="composer">Composer *</Label>
              <Input 
                id="composer" 
                placeholder="e.g., Ludwig van Beethoven"
                {...register('composer', { required: 'Composer is required' })}
              />
              {errors.composer && <p className="text-sm text-destructive">{errors.composer.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="piece">Piece/Work *</Label>
              <Input 
                id="piece" 
                placeholder="e.g., Symphony No. 9 in D minor"
                {...register('piece', { required: 'Piece is required' })}
              />
              {errors.piece && <p className="text-sm text-destructive">{errors.piece.message}</p>}
            </div>
          </div>

          {type === 'recording' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="conductor">Conductor</Label>
                <Input 
                  id="conductor" 
                  placeholder="e.g., Herbert von Karajan"
                  {...register('conductor')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="orchestra">Orchestra/Ensemble</Label>
                <Input 
                  id="orchestra" 
                  placeholder="e.g., Berlin Philharmonic"
                  {...register('orchestra')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="label">Record Label</Label>
                <Input 
                  id="label" 
                  placeholder="e.g., Deutsche Grammophon"
                  {...register('label')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Recording Year</Label>
                <Input 
                  id="year" 
                  type="number" 
                  placeholder="e.g., 1962"
                  {...register('year', { valueAsNumber: true })}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input 
                  id="venue" 
                  placeholder="e.g., Carnegie Hall"
                  {...register('venue')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conductor">Conductor</Label>
                <Input 
                  id="conductor" 
                  placeholder="e.g., Gustavo Dudamel"
                  {...register('conductor')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="orchestra">Orchestra/Ensemble</Label>
                <Input 
                  id="orchestra" 
                  placeholder="e.g., Los Angeles Philharmonic"
                  {...register('orchestra')}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Concert Date {type === 'concert' && '*'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="space-y-2 mb-6">
            <Label>Your Rating</Label>
            <div className="flex items-center space-x-1">
              {renderStars()}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 ? `${rating}/5` : 'No rating'}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="notes">Personal Notes</Label>
            <Textarea
              id="notes"
              placeholder="Share your thoughts, feelings, and observations about this performance..."
              className="min-h-24"
              {...register('notes')}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2 mb-6">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              variant="default" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};