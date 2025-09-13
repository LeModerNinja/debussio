// Advanced concert search component
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';

import type { ConcertFilters } from '@/types';

interface AdvancedConcertSearchProps {
  filters: ConcertFilters;
  onFiltersChange: (filters: ConcertFilters) => void;
}

export function AdvancedConcertSearch({ filters, onFiltersChange }: AdvancedConcertSearchProps) {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(filters.dateRange?.from);
  const [dateTo, setDateTo] = useState<Date | undefined>(filters.dateRange?.to);

  const handleFilterChange = (key: keyof ConcertFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateRangeChange = (from?: Date, to?: Date) => {
    setDateFrom(from);
    setDateTo(to);
    handleFilterChange('dateRange', { from, to });
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    onFiltersChange({});
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search concerts..."
              value={filters.searchQuery || ''}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City or venue"
            value={filters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>

        {/* Composer */}
        <div className="space-y-2">
          <Label htmlFor="composer">Composer</Label>
          <Input
            id="composer"
            placeholder="e.g. Beethoven"
            value={filters.composer || ''}
            onChange={(e) => handleFilterChange('composer', e.target.value)}
          />
        </div>

        {/* Orchestra */}
        <div className="space-y-2">
          <Label htmlFor="orchestra">Orchestra</Label>
          <Input
            id="orchestra"
            placeholder="e.g. Vienna Philharmonic"
            value={filters.orchestra || ''}
            onChange={(e) => handleFilterChange('orchestra', e.target.value)}
          />
        </div>

        {/* Conductor */}
        <div className="space-y-2">
          <Label htmlFor="conductor">Conductor</Label>
          <Input
            id="conductor"
            placeholder="e.g. Herbert von Karajan"
            value={filters.conductor || ''}
            onChange={(e) => handleFilterChange('conductor', e.target.value)}
          />
        </div>

        {/* Venue */}
        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            placeholder="e.g. Carnegie Hall"
            value={filters.venue || ''}
            onChange={(e) => handleFilterChange('venue', e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label htmlFor="price">Price Range</Label>
          <Select value={filters.priceRange || ''} onValueChange={(value) => handleFilterChange('priceRange', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any price</SelectItem>
              <SelectItem value="0-50">$0 - $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="100-200">$100 - $200</SelectItem>
              <SelectItem value="200+">$200+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div className="space-y-2">
          <Label>Date From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={(date) => handleDateRangeChange(date, dateTo)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <Label>Date To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={(date) => handleDateRangeChange(dateFrom, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
}