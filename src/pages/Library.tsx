import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { LogEntry } from '@/components/LogEntry';
import { EntryList } from '@/components/EntryList';
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Your Recorded Music</h2>
                <p className="text-muted-foreground">
                  Albums, symphonies, and performances you've logged
                </p>
              </div>
              <Button onClick={() => handleNewEntry('recording')} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Recording
              </Button>
            </div>
            <EntryList type="recording" />
          </TabsContent>

          <TabsContent value="concerts" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Concert Experiences</h2>
                <p className="text-muted-foreground">
                  Live performances and venues you've attended
                </p>
              </div>
              <Button onClick={() => handleNewEntry('concert')} size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Concert
              </Button>
            </div>
            <EntryList type="concert" />
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