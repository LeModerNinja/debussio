import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { ConcertSearch } from '@/components/ConcertSearch';
import { ConcertList } from '@/components/ConcertList';
import { ConcertCalendar } from '@/components/ConcertCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, List, Search, Heart } from 'lucide-react';

export default function Concerts() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Concert Discovery</h1>
            <p className="text-muted-foreground mt-2">
              Find and explore classical music concerts near you
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <ConcertSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>

        {/* Concert Views */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              My Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Upcoming Concerts</h2>
                <p className="text-muted-foreground">
                  Browse classical music performances
                </p>
              </div>
            </div>
            <ConcertList 
              searchQuery={searchQuery}
              selectedLocation={selectedLocation}
              dateRange={dateRange}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Concert Calendar</h2>
                <p className="text-muted-foreground">
                  View concerts by date
                </p>
              </div>
            </div>
            <ConcertCalendar 
              searchQuery={searchQuery}
              selectedLocation={selectedLocation}
              dateRange={dateRange}
            />
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Favorite Concerts</CardTitle>
                <CardDescription>
                  Concerts you've saved for later
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No favorites yet</p>
                  <p className="mb-4">Save concerts to see them here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}