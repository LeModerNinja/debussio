import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Music } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Entry {
  id: string;
  entry_type: 'recording' | 'concert';
  notes: string;
  rating: number | null;
  tags: string[] | null;
  entry_date: string;
  created_at: string;
}

interface EntryListProps {
  type: 'recording' | 'concert' | 'all';
}

export const EntryList = ({ type }: EntryListProps) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;

      try {
        let query = supabase
          .from('user_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (type !== 'all') {
          query = query.eq('entry_type', type);
        }

        const { data, error } = await query;

        if (error) throw error;
        setEntries(data || []);
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user, type]);

  // Function to extract composer and piece from notes
  const parseEntryTitle = (notes: string) => {
    const lines = notes.split('\n');
    const titleLine = lines[0];
    if (titleLine.includes(' - ')) {
      const [composer, piece] = titleLine.split(' - ', 2);
      return { composer, piece };
    }
    return { composer: 'Unknown', piece: titleLine };
  };

  // Function to render stars for rating
  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-sm text-muted-foreground">No rating</span>;
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < rating ? "fill-accent text-accent" : "text-muted-foreground"
            )}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">{rating}/5</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle className="mb-2">No entries yet</CardTitle>
          <CardDescription>
            Start building your classical music library by logging your first{' '}
            {type === 'all' ? 'recording or concert' : type}.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const { composer, piece } = parseEntryTitle(entry.notes);
        
        return (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{piece}</CardTitle>
                  <CardDescription className="text-base font-medium text-foreground/80">
                    {composer}
                  </CardDescription>
                </div>
                <Badge variant={entry.entry_type === 'recording' ? 'default' : 'secondary'}>
                  {entry.entry_type}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                {renderStars(entry.rating)}
                <span className="text-sm text-muted-foreground">
                  {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Display formatted notes content */}
              <div className="text-sm text-muted-foreground space-y-1">
                {entry.notes.split('\n').slice(1).map((line, i) => {
                  if (line.trim() === '') return null;
                  if (line.startsWith('Notes: ')) {
                    return (
                      <div key={i} className="pt-2">
                        <p className="text-foreground">{line.replace('Notes: ', '')}</p>
                      </div>
                    );
                  }
                  return <p key={i}>{line}</p>;
                })}
              </div>
              
              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};