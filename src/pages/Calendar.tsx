import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { ConcertCalendar } from '@/components/ConcertCalendar';
import { AdvancedConcertSearch } from '@/components/AdvancedConcertSearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, MapPin, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ConcertFilters } from '@/components/AdvancedConcertSearch';

export default function Calendar() {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<ConcertFilters>({
    searchQuery: '',
    location: '',
    composer: '',
    orchestra: '',
    conductor: '',
    venue: '',
    priceRange: '',
    dateRange: { from: undefined, to: undefined },
    tags: []
  });

  const handleFiltersChange = (newFilters: ConcertFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header Section */}
      <div className="border-b border-border/40 bg-gradient-to-r from-background via-background/90 to-background">
        <div className="content-container py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gradient-primary">
              <CalendarIcon className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-serif mb-2">Concert Calendar</h1>
              <p className="text-xl text-muted-foreground">
                Discover classical music concerts happening around you
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Global venues</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>AI-powered discovery</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Advanced filtering</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-container py-8">
        {/* Search and Filter Controls */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Find Concerts</CardTitle>
                <CardDescription>
                  Use the calendar below to browse concerts or apply advanced filters
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showAdvancedSearch ? 'Hide Filters' : 'Advanced Search'}
              </Button>
            </div>
          </CardHeader>
          {showAdvancedSearch && (
            <CardContent>
              <AdvancedConcertSearch 
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </CardContent>
          )}
        </Card>

        {/* Active Filters Display */}
        {(filters.searchQuery || filters.location || filters.composer || filters.orchestra || 
          filters.conductor || filters.venue || filters.tags.length > 0) && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
                {filters.searchQuery && (
                  <Badge variant="secondary">Search: "{filters.searchQuery}"</Badge>
                )}
                {filters.location && (
                  <Badge variant="secondary">Location: {filters.location}</Badge>
                )}
                {filters.composer && (
                  <Badge variant="secondary">Composer: {filters.composer}</Badge>
                )}
                {filters.orchestra && (
                  <Badge variant="secondary">Orchestra: {filters.orchestra}</Badge>
                )}
                {filters.conductor && (
                  <Badge variant="secondary">Conductor: {filters.conductor}</Badge>
                )}
                {filters.venue && (
                  <Badge variant="secondary">Venue: {filters.venue}</Badge>
                )}
                {filters.tags.map(tag => (
                  <Badge key={tag} variant="secondary">Tag: {tag}</Badge>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilters({
                    searchQuery: '',
                    location: '',
                    composer: '',
                    orchestra: '',
                    conductor: '',
                    venue: '',
                    priceRange: '',
                    dateRange: { from: undefined, to: undefined },
                    tags: []
                  })}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar Component */}
        <ConcertCalendar 
          searchQuery={filters.searchQuery}
          selectedLocation={filters.location}
          dateRange={filters.dateRange}
        />

        {/* Tips and Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use the Calendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Browsing Concerts</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dates with concerts are highlighted in blue</li>
                  <li>• Click on any date to see concerts scheduled</li>
                  <li>• Use the month navigation to browse different periods</li>
                  <li>• Save concerts to your favorites by clicking the heart icon</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Sources</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• TicketMaster Discovery API for major venues</li>
                  <li>• Bandsintown API for artist-specific events</li>
                  <li>• Manual entries from the community</li>
                  <li>• AI-generated tags for better discovery</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}