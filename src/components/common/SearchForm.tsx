// Reusable search form component
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { SearchFilters } from '@/types';
import { SAMPLE_DATA } from '@/constants';

interface SearchFormProps {
  onFiltersChange: (filters: SearchFilters) => void;
  filters: SearchFilters;
  type?: 'library' | 'concerts';
}

export function SearchForm({ onFiltersChange, filters, type = 'library' }: SearchFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search {type === 'library' ? 'Library' : 'Concerts'}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Advanced
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search everything..."
            value={filters.general || ''}
            onChange={(e) => updateFilter('general', e.target.value)}
            className="pl-10"
          />
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Composer</Label>
              <Select value={filters.composer || ''} onValueChange={(value) => updateFilter('composer', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any composer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any composer</SelectItem>
                  {SAMPLE_DATA.composers.map(composer => (
                    <SelectItem key={composer} value={composer}>{composer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === 'concerts' && (
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={filters.location || ''} onValueChange={(value) => updateFilter('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any location</SelectItem>
                    {SAMPLE_DATA.locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full gap-2"
                disabled={!hasActiveFilters}
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}