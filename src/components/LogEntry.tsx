import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Star, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LogEntryProps {
  type: 'recording' | 'concert';
  onClose: () => void;
}

export const LogEntry = ({ type, onClose }: LogEntryProps) => {
  const [date, setDate] = useState<Date>();
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="composer">Composer</Label>
            <Input id="composer" placeholder="e.g., Ludwig van Beethoven" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="piece">Piece/Work</Label>
            <Input id="piece" placeholder="e.g., Symphony No. 9 in D minor" />
          </div>
        </div>

        {type === 'recording' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conductor">Conductor</Label>
              <Input id="conductor" placeholder="e.g., Herbert von Karajan" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orchestra">Orchestra/Ensemble</Label>
              <Input id="orchestra" placeholder="e.g., Berlin Philharmonic" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="label">Record Label</Label>
              <Input id="label" placeholder="e.g., Deutsche Grammophon" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Recording Year</Label>
              <Input id="year" type="number" placeholder="e.g., 1962" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" placeholder="e.g., Carnegie Hall" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conductor">Conductor</Label>
              <Input id="conductor" placeholder="e.g., Gustavo Dudamel" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orchestra">Orchestra/Ensemble</Label>
              <Input id="orchestra" placeholder="e.g., Los Angeles Philharmonic" />
            </div>
            
            <div className="space-y-2">
              <Label>Concert Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
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
        <div className="space-y-2">
          <Label>Your Rating</Label>
          <div className="flex items-center space-x-1">
            {renderStars()}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating > 0 ? `${rating}/5` : 'No rating'}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Personal Notes</Label>
          <Textarea
            id="notes"
            placeholder="Share your thoughts, feelings, and observations about this performance..."
            className="min-h-24"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
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
            <Button variant="outline" size="icon" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="default" className="flex-1">
            Save Entry
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};