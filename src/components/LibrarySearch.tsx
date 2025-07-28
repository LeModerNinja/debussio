import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface LibrarySearchProps {
  onSearchChange: (filters: LibrarySearchFilters) => void;
}

export interface LibrarySearchFilters {
  general?: string;
  composer?: string;
  pieceTitle?: string;
  performer?: string;
  conductor?: string;
  entryType?: string;
  rating?: string;
  genre?: string;
  period?: string;
}

export function LibrarySearch({ onSearchChange }: LibrarySearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<LibrarySearchFilters>({});

  // Update filters and notify parent component
  const updateFilter = (key: keyof LibrarySearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onSearchChange(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters: LibrarySearchFilters = {};
    setFilters(emptyFilters);
    onSearchChange(emptyFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value && value.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Library
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Advanced Search
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* General Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search everything (composer, piece, performer, notes...)..."
            value={filters.general || ''}
            onChange={(e) => updateFilter('general', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Advanced Search Fields */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Composer Search */}
              <div className="space-y-2">
                <Label htmlFor="composer">Composer</Label>
                <Input
                  id="composer"
                  placeholder="e.g., Dvořák, Beethoven"
                  value={filters.composer || ''}
                  onChange={(e) => updateFilter('composer', e.target.value)}
                />
              </div>

              {/* Piece Title Search */}
              <div className="space-y-2">
                <Label htmlFor="piece">Piece Title</Label>
                <Input
                  id="piece"
                  placeholder="e.g., American, Symphony"
                  value={filters.pieceTitle || ''}
                  onChange={(e) => updateFilter('pieceTitle', e.target.value)}
                />
              </div>

              {/* Performer/Orchestra Search */}
              <div className="space-y-2">
                <Label htmlFor="performer">Orchestra/Performer</Label>
                <Input
                  id="performer"
                  placeholder="e.g., Vienna Philharmonic"
                  value={filters.performer || ''}
                  onChange={(e) => updateFilter('performer', e.target.value)}
                />
              </div>

              {/* Conductor Search */}
              <div className="space-y-2">
                <Label htmlFor="conductor">Conductor</Label>
                <Input
                  id="conductor"
                  placeholder="e.g., Karajan, Bernstein"
                  value={filters.conductor || ''}
                  onChange={(e) => updateFilter('conductor', e.target.value)}
                />
              </div>

              {/* Entry Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="entryType">Entry Type</Label>
                <Select value={filters.entryType || ''} onValueChange={(value) => updateFilter('entryType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any type</SelectItem>
                    <SelectItem value="recording">Recordings</SelectItem>
                    <SelectItem value="concert">Concerts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <Label htmlFor="rating">Minimum Rating</Label>
                <Select value={filters.rating || ''} onValueChange={(value) => updateFilter('rating', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any rating</SelectItem>
                    <SelectItem value="5">5 stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="2">2+ stars</SelectItem>
                    <SelectItem value="1">1+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Genre Filter */}
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select value={filters.genre || ''} onValueChange={(value) => updateFilter('genre', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any genre</SelectItem>
                    <SelectItem value="Symphony">Symphony</SelectItem>
                    <SelectItem value="Concerto">Concerto</SelectItem>
                    <SelectItem value="Chamber Music">Chamber Music</SelectItem>
                    <SelectItem value="Opera">Opera</SelectItem>
                    <SelectItem value="Piano Sonata">Piano Sonata</SelectItem>
                    <SelectItem value="String Quartet">String Quartet</SelectItem>
                    <SelectItem value="Song">Song</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Period Filter */}
              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select value={filters.period || ''} onValueChange={(value) => updateFilter('period', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any period</SelectItem>
                    <SelectItem value="Baroque">Baroque</SelectItem>
                    <SelectItem value="Classical">Classical</SelectItem>
                    <SelectItem value="Romantic">Romantic</SelectItem>
                    <SelectItem value="Modern">Modern</SelectItem>
                    <SelectItem value="Contemporary">Contemporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
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

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Active filters:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => 
                    value ? (
                      <div key={key} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs flex items-center gap-1">
                        {key === 'general' ? 'General' :
                         key === 'pieceTitle' ? 'Piece' :
                         key === 'entryType' ? 'Type' :
                         key.charAt(0).toUpperCase() + key.slice(1)
                        }: {value}
                        <button
                          onClick={() => updateFilter(key as keyof LibrarySearchFilters, '')}
                          className="ml-1 hover:bg-primary/20 rounded p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}