import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { AdvancedConcertSearch, type ConcertFilters } from '@/components/AdvancedConcertSearch';
import { EnhancedConcertList } from '@/components/EnhancedConcertList';
import { ConcertFavorites } from '@/components/ConcertFavorites';
import { ConcertList } from '@/components/ConcertList';
import { ConcertCalendar } from '@/components/ConcertCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, List, Search, Heart, Grid3X3, LayoutList } from 'lucide-react';

export default function Concerts() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ConcertFilters>({
    searchQuery: '',
    location: '',
    dateRange: {},
    composer: '',
    orchestra: '',
    conductor: '',
    venue: '',
    priceRange: '',
    tags: []
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

        {/* Advanced Search and Filters */}
        <div className="mb-8">
          <AdvancedConcertSearch 
            filters={filters}
            onFiltersChange={setFilters}
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
                <h2 className="text-xl font-semibold">Discover Concerts</h2>
                <p className="text-muted-foreground">
                  Browse classical music performances with advanced filtering
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <LayoutList className="h-4 w-4" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </Button>
              </div>
            </div>
            <EnhancedConcertList 
              filters={filters}
              viewMode={viewMode}
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
              searchQuery={filters.searchQuery}
              selectedLocation={filters.location}
              dateRange={filters.dateRange}
            />
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <ConcertFavorites />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}