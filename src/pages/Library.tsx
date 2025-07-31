import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { LogEntryForm } from '@/components/common/LogEntryForm';
import { EntryCard } from '@/components/common/EntryCard';
import { SearchForm } from '@/components/common/SearchForm';
import { useEntries } from '@/hooks/useEntries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Music, Calendar, Star, BarChart3 } from 'lucide-react';
import type { SearchFilters } from '@/types';

export default function Library() {
  const { user } = useAuth();
  const [showLogEntry, setShowLogEntry] = useState(false);
  const [entryType, setEntryType] = useState<'recording' | 'concert'>('recording');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  
  const { entries: recordings, loading: recordingsLoading } = useEntries('recording', searchFilters);
  const { entries: concerts, loading: concertsLoading } = useEntries('concert', searchFilters);
  const { entries: allEntries } = useEntries(undefined, searchFilters);

  const handleNewEntry = (type: 'recording' | 'concert') => {
    setEntryType(type);
    setShowLogEntry(true);
  };

  const stats = {
    recordings: 24,
    concerts: 8,
    favorites: 12,
    thisMonth: 5
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Stats */}
      <div className="bg-gradient-subtle border-b border-border/50">
        <div className="content-container py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-display text-foreground mb-4">
                My Classical Journey
              </h1>
              <p className="text-body text-muted-foreground mb-6 max-w-lg">
                Your personal collection of classical music experiences, from intimate chamber concerts to epic symphonic recordings.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handleNewEntry('recording')} className="btn-primary-gradient gap-2">
                  <Music className="h-4 w-4" />
                  Log Recording
                </Button>
                <Button onClick={() => handleNewEntry('concert')} variant="outline" className="gap-2 hover-lift">
                  <Calendar className="h-4 w-4" />
                  Log Concert
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-card hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Recordings</p>
                      <p className="text-2xl font-bold text-primary">{stats.recordings}</p>
                    </div>
                    <Music className="h-8 w-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Concerts</p>
                      <p className="text-2xl font-bold text-accent">{stats.concerts}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-accent/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Favorites</p>
                      <p className="text-2xl font-bold text-yellow-400">{stats.favorites}</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-400/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold text-green-400">{stats.thisMonth}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-400/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <main className="content-container py-8">
        {/* Log Entry Modal */}
        <Dialog open={showLogEntry} onOpenChange={setShowLogEntry}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <LogEntryForm 
              type={entryType} 
              onSuccess={() => setShowLogEntry(false)} 
            />
          </DialogContent>
        </Dialog>

        {/* Advanced Search - Prominently Placed */}
        <div className="mb-8">
          <SearchForm 
            onFiltersChange={setSearchFilters} 
            filters={searchFilters}
            type="library"
          />
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="recordings" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="recordings" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Recordings
            </TabsTrigger>
            <TabsTrigger value="concerts" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Concerts
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recordings" className="space-y-6">
            <div className="space-y-4">
              {recordingsLoading ? (
                <div>Loading recordings...</div>
              ) : recordings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-lg font-medium mb-2">No recordings yet</p>
                    <p className="text-muted-foreground">Start building your library by logging your first recording.</p>
                  </CardContent>
                </Card>
              ) : (
                recordings.map(entry => (
                  <EntryCard key={entry.id} entry={entry} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="concerts" className="space-y-6">
            <div className="space-y-4">
              {concertsLoading ? (
                <div>Loading concerts...</div>
              ) : concerts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-lg font-medium mb-2">No concerts yet</p>
                    <p className="text-muted-foreground">Start building your library by logging your first concert.</p>
                  </CardContent>
                </Card>
              ) : (
                concerts.map(entry => (
                  <EntryCard key={entry.id} entry={entry} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card className="glass-card">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary/10 rounded-full flex items-center justify-center">
                  <Star className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-heading">Your Musical Treasures</CardTitle>
                <CardDescription>
                  The pieces and performances that have touched your soul
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">No favorites marked yet</p>
                  <p className="text-sm">
                    Start favoriting recordings and concerts to build your personal collection of musical gems
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}