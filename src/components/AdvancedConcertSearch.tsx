import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Search, Filter, X, Music, Users, Crown, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface ConcertFilters {
  searchQuery: string;
  location: string;
  dateRange: { from?: Date; to?: Date };
  composer: string;
  orchestra: string;
  conductor: string;
  venue: string;
  priceRange: string;
  tags: string[];
}

interface AdvancedConcertSearchProps {
  filters: ConcertFilters;
  onFiltersChange: (filters: ConcertFilters) => void;
}

// Predefined filter options - could be fetched from API in real implementation
const composers = [
  'Bach', 'Mozart', 'Beethoven', 'Tchaikovsky', 'Chopin', 'Brahms', 
  'Vivaldi', 'Debussy', 'Rachmaninoff', 'Stravinsky'
];

const orchestras = [
  'Berlin Philharmonic', 'Vienna Philharmonic', 'London Symphony Orchestra',
  'New York Philharmonic', 'Chicago Symphony Orchestra', 'Boston Symphony Orchestra',
  'Royal Concertgebouw Orchestra', 'Philadelphia Orchestra'
];

const conductors = [
  'Herbert von Karajan', 'Leonard Bernstein', 'Gustavo Dudamel', 'Daniel Barenboim',
  'Marin Alsop', 'Yuja Wang', 'Lang Lang', 'Simon Rattle'
];

const venues = [
  'Carnegie Hall', 'Vienna State Opera', 'Royal Albert Hall', 'Sydney Opera House',
  'La Scala', 'Berlin Philharmonie', 'Walt Disney Concert Hall', 'Kennedy Center'
];

const locations = [
  'New York', 'London', 'Vienna', 'Berlin', 'Paris', 'Boston', 'Chicago',
  'Los Angeles', 'Sydney', 'Milan', 'Amsterdam', 'Philadelphia'
];

const concertTags = [
  'Symphony', 'Chamber Music', 'Solo Performance', 'Opera', 'Contemporary',
  'Baroque', 'Romantic', 'Jazz Fusion', 'World Premiere', 'Family Friendly'
];

export function AdvancedConcertSearch({ filters, onFiltersChange }: AdvancedConcertSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof ConcertFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    updateFilter('tags', newTags);
  };

  const clearAllFilters = () => {
    onFiltersChange({
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
  };

  const hasActiveFilters = () => {
    return filters.searchQuery || 
           filters.location || 
           filters.dateRange.from || 
           filters.composer || 
           filters.orchestra || 
           filters.conductor || 
           filters.venue || 
           filters.priceRange ||
           (filters.tags && filters.tags.length > 0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Discover Concerts
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {showAdvanced ? 'Basic Search' : 'Advanced Search'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, composer, piece, orchestra, conductor..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Select value={filters.location} onValueChange={(value) => updateFilter('location', value === 'all' ? '' : value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Location</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location.toLowerCase()}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal min-w-48",
                  !filters.dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "MMM dd")} -{" "}
                      {format(filters.dateRange.to, "MMM dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "MMM dd, y")
                  )
                ) : (
                  <span>Select dates</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={filters.dateRange.from && filters.dateRange.to ? 
                  { from: filters.dateRange.from, to: filters.dateRange.to } : undefined}
                onSelect={(range) => updateFilter('dateRange', range || {})}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            <Separator />
            <div className="space-y-6">
              {/* Artist & Performance Filters */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Artists & Performers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Composer</Label>
                    <Select value={filters.composer} onValueChange={(value) => updateFilter('composer', value === 'all' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any composer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Composer</SelectItem>
                        {composers.map(composer => (
                          <SelectItem key={composer} value={composer.toLowerCase()}>{composer}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Orchestra</Label>
                    <Select value={filters.orchestra} onValueChange={(value) => updateFilter('orchestra', value === 'all' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any orchestra" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Orchestra</SelectItem>
                        {orchestras.map(orchestra => (
                          <SelectItem key={orchestra} value={orchestra.toLowerCase()}>{orchestra}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Conductor</Label>
                    <Select value={filters.conductor} onValueChange={(value) => updateFilter('conductor', value === 'all' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any conductor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Conductor</SelectItem>
                        {conductors.map(conductor => (
                          <SelectItem key={conductor} value={conductor.toLowerCase()}>{conductor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Venue & Logistics */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Venue & Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Select value={filters.venue} onValueChange={(value) => updateFilter('venue', value === 'all' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any venue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Venue</SelectItem>
                        {venues.map(venue => (
                          <SelectItem key={venue} value={venue.toLowerCase()}>{venue}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Price Range</Label>
                    <Select value={filters.priceRange} onValueChange={(value) => updateFilter('priceRange', value === 'all' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Price</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="under-50">Under $50</SelectItem>
                        <SelectItem value="50-100">$50 - $100</SelectItem>
                        <SelectItem value="100-200">$100 - $200</SelectItem>
                        <SelectItem value="over-200">Over $200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Concert Categories/Tags */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Concert Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {concertTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={filters.tags?.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-2 text-sm">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {filters.searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {filters.searchQuery}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter('searchQuery', '')}
                    />
                  </Badge>
                )}
                {filters.location && (
                  <Badge variant="secondary" className="gap-1">
                    Location: {filters.location}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter('location', '')}
                    />
                  </Badge>
                )}
                {filters.dateRange.from && (
                  <Badge variant="secondary" className="gap-1">
                    Date: {format(filters.dateRange.from, "MMM dd")}
                    {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM dd")}`}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter('dateRange', {})}
                    />
                  </Badge>
                )}
                {filters.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}