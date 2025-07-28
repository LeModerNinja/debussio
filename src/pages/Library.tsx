import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { LogEntry } from '@/components/LogEntry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Music, Calendar, Star } from 'lucide-react';

export default function Library() {
  const { user } = useAuth();
  const [showLogEntry, setShowLogEntry] = useState(false);
  const [entryType, setEntryType] = useState<'recording' | 'concert'>('recording');

  const handleNewEntry = (type: 'recording' | 'concert') => {
    setEntryType(type);
    setShowLogEntry(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
            <p className="text-muted-foreground mt-2">
              Your personal collection of classical music experiences
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => handleNewEntry('recording')} className="gap-2">
              <Music className="h-4 w-4" />
              Log Recording
            </Button>
            <Button onClick={() => handleNewEntry('concert')} variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Log Concert
            </Button>
          </div>
        </div>

        {showLogEntry && (
          <div className="mb-8">
            <LogEntry 
              type={entryType} 
              onClose={() => setShowLogEntry(false)}
            />
          </div>
        )}

        <Tabs defaultValue="recordings" className="space-y-6">
          <TabsList>
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

          <TabsContent value="recordings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Recorded Music</CardTitle>
                <CardDescription>
                  Albums, symphonies, and performances you've logged
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No recordings logged yet</p>
                  <p className="mb-4">Start building your classical music library</p>
                  <Button onClick={() => handleNewEntry('recording')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Your First Recording
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Concert Experiences</CardTitle>
                <CardDescription>
                  Live performances and venues you've attended
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No concerts logged yet</p>
                  <p className="mb-4">Share your live classical music experiences</p>
                  <Button onClick={() => handleNewEntry('concert')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Your First Concert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Favorites</CardTitle>
                <CardDescription>
                  Your most beloved pieces and performances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No favorites yet</p>
                  <p className="mb-4">Mark recordings and concerts as favorites to see them here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}