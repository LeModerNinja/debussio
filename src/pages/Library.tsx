import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { EnhancedLogEntryForm } from '@/components/EnhancedLogEntryForm';
import { EntryList } from '@/components/EntryList';
import { LibrarySearch, LibrarySearchFilters } from '@/components/LibrarySearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Music, Calendar, Star, Filter, Grid3X3, List, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Library() {
  const { user } = useAuth();
  const [showLogEntry, setShowLogEntry] = useState(false);
  const [entryType, setEntryType] = useState<'recording' | 'concert'>('recording');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchFilters, setSearchFilters] = useState<LibrarySearchFilters>({});

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
            <EnhancedLogEntryForm 
              type={entryType} 
              onSuccess={() => setShowLogEntry(false)} 
            />
          </DialogContent>
        </Dialog>

        {/* Advanced Search - Prominently Placed */}
        <div className="mb-8">
          <LibrarySearch onSearchChange={setSearchFilters} />
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Select defaultValue="recent">
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="composer">Composer</SelectItem>
                <SelectItem value="date">Date Added</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center rounded-lg border border-border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
            <EntryList type="recording" searchFilters={searchFilters} />
          </TabsContent>

          <TabsContent value="concerts" className="space-y-6">
            <EntryList type="concert" searchFilters={searchFilters} />
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