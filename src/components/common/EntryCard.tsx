// Reusable entry card component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Trash2, Music, Calendar, Building, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { UserEntry } from '@/types';

interface EntryCardProps {
  entry: UserEntry;
  onEdit?: (entry: UserEntry) => void;
  onDelete?: (entryId: string) => void;
}

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const isRecording = entry.entry_type === 'recording';
  const icon = isRecording ? Music : Calendar;
  const IconComponent = icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <IconComponent className="h-4 w-4 text-primary" />
              <Badge variant="outline">
                {isRecording ? 'Recording' : 'Concert'}
              </Badge>
              {entry.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{entry.rating}/5</span>
                </div>
              )}
            </div>
            
            {isRecording && entry.recording?.piece ? (
              <div>
                <CardTitle className="text-xl">{entry.recording.piece.title}</CardTitle>
                <CardDescription className="mt-1">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {entry.recording.piece.composer?.name}
                      {entry.recording.piece.opus_number && (
                        <span className="text-muted-foreground ml-1">
                          • {entry.recording.piece.opus_number}
                        </span>
                      )}
                    </div>
                    {entry.recording.orchestra && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {entry.recording.orchestra}
                        {entry.recording.conductor && (
                          <span className="text-muted-foreground">
                            • {entry.recording.conductor}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardDescription>
              </div>
            ) : entry.concert ? (
              <div>
                <CardTitle className="text-xl">{entry.concert.title}</CardTitle>
                <CardDescription className="mt-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {entry.concert.venue}, {entry.concert.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(entry.concert.concert_date), 'MMM dd, yyyy')}
                      {entry.concert.start_time && (
                        <span className="flex items-center gap-1 ml-2">
                          <Clock className="h-3 w-3" />
                          {entry.concert.start_time}
                        </span>
                      )}
                    </div>
                  </div>
                </CardDescription>
              </div>
            ) : (
              <div>
                <CardTitle className="text-xl">Custom Entry</CardTitle>
                <CardDescription>
                  {entry.notes ? entry.notes.split('\n')[0] : 'No title available'}
                </CardDescription>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(entry.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm space-y-2">
          <div>
            <strong>Logged on:</strong> {format(new Date(entry.entry_date), 'MMM dd, yyyy')}
          </div>
          
          {entry.notes && (
            <div>
              <strong>Notes:</strong>
              <p className="mt-1 text-muted-foreground">{entry.notes}</p>
            </div>
          )}
        </div>

        {entry.tags && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}