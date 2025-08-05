import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Music, User, Calendar, Play, ExternalLink } from 'lucide-react';
import { musicBrainzService } from '@/services/musicBrainzService';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  title: string;
  disambiguation?: string;
  artists?: string[];
  composer?: string;
  releaseTitle?: string;
  releaseDate?: string;
  label?: string;
  duration?: number | null;
  type?: string;
  opusNumber?: string;
  keySignature?: string;
}

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'works' | 'recordings'>('works');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [featuredWorks, setFeaturedWorks] = useState<SearchResult[]>([]);

  // Load featured classical works on component mount
  useEffect(() => {
    loadFeaturedWorks();
  }, []);

  const loadFeaturedWorks = async () => {
    try {
      setLoading(true);
      // Search for popular classical works
      const popularComposers = ['Bach', 'Mozart', 'Beethoven', 'Chopin'];
      const allResults: SearchResult[] = [];
      
      for (const composer of popularComposers) {
        try {
          const response = await musicBrainzService.searchWorks('', composer, 3);
          if (response.works) {
            const extractedWorks = response.works.map(work => 
              musicBrainzService.extractWorkInfo(work)
            );
            allResults.push(...extractedWorks);
          }
        } catch (error) {
          console.error(`Error loading works for ${composer}:`, error);
        }
      }
      
      setFeaturedWorks(allResults.slice(0, 12));
    } catch (error) {
      console.error('Error loading featured works:', error);
      toast.error('Failed to load featured works');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (searchType === 'works') {
        response = await musicBrainzService.searchWorks(searchQuery);
        if (response.works) {
          const extractedResults = response.works.map(work => 
            musicBrainzService.extractWorkInfo(work)
          );
          setResults(extractedResults);
        }
      } else {
        response = await musicBrainzService.searchRecordings(searchQuery);
        if (response.recordings) {
          const extractedResults = response.recordings.map(recording => 
            musicBrainzService.extractRecordingInfo(recording)
          );
          setResults(extractedResults);
        }
      }
      
      if ((!response.works && !response.recordings) || (response.works?.length === 0 && response.recordings?.length === 0)) {
        toast.info('No results found. Try a different search term.');
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const ResultCard = ({ result }: { result: SearchResult }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{result.title}</CardTitle>
            {result.disambiguation && (
              <p className="text-sm text-muted-foreground mt-1">{result.disambiguation}</p>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Composer/Artist Information */}
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

          {/* Additional Details */}
          <div className="flex flex-wrap gap-2">
            {result.type && (
              <Badge variant="secondary" className="text-xs">
                {result.type}
              </Badge>
            )}
            {result.opusNumber && (
              <Badge variant="outline" className="text-xs">
                Op. {result.opusNumber}
              </Badge>
            )}
            {result.keySignature && (
              <Badge variant="outline" className="text-xs">
                {result.keySignature}
              </Badge>
            )}
          </div>

          {/* Recording-specific info */}
          {searchType === 'recordings' && (
            <div className="space-y-2">
              {result.releaseTitle && (
                <p className="text-sm text-muted-foreground">
                  <strong>Album:</strong> {result.releaseTitle}
                </p>
              )}
              {result.releaseDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{result.releaseDate}</span>
                </div>
              )}
              {result.label && (
                <p className="text-sm text-muted-foreground">
                  <strong>Label:</strong> {result.label}
                </p>
              )}
              {result.duration && (
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{result.duration} min</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Discover Classical Music
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the vast world of classical music with comprehensive information from MusicBrainz
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Classical Music
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Tabs value={searchType} onValueChange={(value) => setSearchType(value as 'works' | 'recordings')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="works">Musical Works</TabsTrigger>
                  <TabsTrigger value="recordings">Recordings</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex gap-2">
                <Input
                  placeholder={searchType === 'works' ? 'Search for symphonies, concertos, sonatas...' : 'Search for recordings, albums, performances...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Search Results ({results.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          </div>
        )}

        {/* Featured Works Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Featured Classical Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && featuredWorks.length === 0 ? (
              // Show loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))
            ) : (
              featuredWorks.map((work) => (
                <ResultCard key={work.id} result={work} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Discover;