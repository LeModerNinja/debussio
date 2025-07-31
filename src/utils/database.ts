// Centralized database utilities
import { supabase } from '@/integrations/supabase/client';

export class DatabaseUtils {
  static async createOrFindComposer(name: string) {
    const { data, error } = await supabase
      .from('composers')
      .upsert({ name: name.trim() }, { onConflict: 'name' })
      .select('id')
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createOrFindPiece(title: string, composerId: string) {
    const { data, error } = await supabase
      .from('pieces')
      .upsert({
        title: title.trim(),
        composer_id: composerId
      }, { onConflict: 'title,composer_id' })
      .select('id')
      .single();
    
    if (error) throw error;
    return data;
  }

  static async toggleFavorite(userId: string, itemId: string, itemType: 'recording' | 'concert') {
    const column = itemType === 'recording' ? 'recording_id' : 'concert_id';
    
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq(column, itemId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq(column, itemId);
      return false; // Removed
    } else {
      await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          [column]: itemId
        });
      return true; // Added
    }
  }
}