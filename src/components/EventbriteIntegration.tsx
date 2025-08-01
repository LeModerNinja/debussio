import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { EventbriteService } from '../services/eventbriteService';
import { toast } from 'sonner';

// Basic Eventbrite integration component for syncing classical music events
export const EventbriteIntegration: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await EventbriteService.searchClassicalEvents({
        limit: 50
      });
      
      if (result.success) {
        toast.success(`${result.message}. Synced ${result.syncedCount} events.`);
      } else {
        toast.error(result.message || 'Failed to sync events');
      }
    } catch (error) {
      toast.error('Error syncing Eventbrite events');
      console.error('Eventbrite sync error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventbrite Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Sync classical music events from Eventbrite to discover concerts in your area.
        </p>
        <Button 
          onClick={handleSync} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Syncing...' : 'Sync Classical Events'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventbriteIntegration;