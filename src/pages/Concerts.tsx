import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { SearchForm } from '@/components/common/SearchForm';
import { ConcertCalendar } from '@/components/ConcertCalendar';
import { useConcerts } from '@/hooks/useConcerts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, List, Heart, MapPin, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import type { SearchFilters } from '@/types';

export default function Concerts() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const { concerts, favorites, loading, toggleFavorite } = useConcerts(filters);

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
          <SearchForm 
            onFiltersChange={setFilters} 
            filters={filters}
            type="concerts"
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
            <div className="space-y-4">
              {loading ? (
                <div>Loading concerts...</div>
              ) : concerts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-lg font-medium mb-2">No concerts found</p>
                    <p className="text-muted-foreground">Try adjusting your search criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                concerts.map(concert => (
                  <Card key={concert.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{concert.title}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {concert.venue}, {concert.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(concert.concert_date), 'MMM dd, yyyy')}
                              {concert.start_time && (
                                <span className="flex items-center gap-1 ml-2">
                                  <Clock className="h-4 w-4" />
                                  {concert.start_time}
                                </span>
                              )}
                            </span>
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(concert.id)}
                        >
                          <Heart 
                            className={`h-4 w-4 ${
                              favorites.has(concert.id) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {concert.orchestra && (
                        <p className="text-sm"><strong>Orchestra:</strong> {concert.orchestra}</p>
                      )}
                      {concert.conductor && (
                        <p className="text-sm"><strong>Conductor:</strong> {concert.conductor}</p>
                      )}
                      {concert.tags && (
                        <div className="flex flex-wrap gap-2">
                          {concert.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      {concert.ticket_url && (
                        <div className="flex justify-end">
                          <Button asChild size="sm" className="gap-2">
                            <a href={concert.ticket_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              Get Tickets
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
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
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">No favorites yet</p>
                <p className="text-muted-foreground">Save concerts you're interested in</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}