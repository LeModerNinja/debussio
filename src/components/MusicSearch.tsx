import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Music, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface MusicSearchProps {
  onSelect: (result: MusicSearchResult) => void;
  placeholder?: string;
  className?: string;
}

export const MusicSearch = ({ onSelect, placeholder = "Search for a classical piece...", className }: MusicSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MusicSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 2) {
        searchMusic(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchMusic = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      console.log('Searching for:', searchQuery);
      
      const { data, error } = await supabase.functions.invoke('musicbrainz-search', {
        body: { 
          query: searchQuery, 
          type: 'work' 
        }
      });

      if (error) {
        console.error('Search error:', error);
        return;
      }

      console.log('Search results:', data);
      setResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to search:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (result: MusicSearchResult) => {
    setQuery(result.title);
    setShowResults(false);
    onSelect(result);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-4"
          onFocus={() => query.length > 2 && setShowResults(true)}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {results.map((result) => (
              <Button
                key={result.id}
                variant="ghost"
                className="w-full justify-start p-4 h-auto text-left hover:bg-muted/50"
                onClick={() => handleSelect(result)}
              >
                <div className="flex items-start gap-3 w-full">
                  <Music className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1 truncate">
                      {result.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <User className="h-3 w-3" />
                      <span>{result.composer}</span>
                      {result.type && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{result.type}</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.opus && (
                        <Badge variant="outline" className="text-xs">
                          Op. {result.opus}
                        </Badge>
                      )}
                      {result.catalog && (
                        <Badge variant="outline" className="text-xs">
                          {result.catalog}
                        </Badge>
                      )}
                      {result.key && (
                        <Badge variant="outline" className="text-xs">
                          {result.key}
                        </Badge>
                      )}
                      {result.genre && (
                        <Badge variant="secondary" className="text-xs">
                          {result.genre}
                        </Badge>
                      )}
                    </div>
                    {result.disambiguation && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {result.disambiguation}
                      </p>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {showResults && results.length === 0 && !isLoading && query.length > 2 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
          <CardContent className="p-4 text-center text-muted-foreground">
            <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pieces found for "{query}"</p>
            <p className="text-xs mt-1">Try searching with composer name or opus number</p>
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};