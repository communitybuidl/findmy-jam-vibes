import { supabase } from '../integrations/supabase/client';

export const createMusicLinksTable = async () => {
  try {
    console.log('Creating music_links table...');
    
    // Create the table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS music_links (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            service TEXT NOT NULL,
            url TEXT NOT NULL,
            display_name TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.error('Error creating table:', createError);
      return { success: false, error: createError };
    }

    console.log('Table created successfully');

    // Insert sample data
    const { error: insertError } = await supabase
      .from('music_links')
      .insert([
        {
          profile_id: '550e8400-e29b-41d4-a716-446655440001',
          service: 'spotify',
          url: 'https://open.spotify.com/artist/example1',
          display_name: 'Alex Rodriguez Music'
        },
        {
          profile_id: '550e8400-e29b-41d4-a716-446655440001',
          service: 'soundcloud',
          url: 'https://soundcloud.com/alexrodriguez',
          display_name: 'Alex Rodriguez'
        },
        {
          profile_id: '550e8400-e29b-41d4-a716-446655440002',
          service: 'youtube',
          url: 'https://youtube.com/@mayachen',
          display_name: 'Maya Chen Official'
        }
      ]);

    if (insertError) {
      console.error('Error inserting sample data:', insertError);
      return { success: false, error: insertError };
    }

    console.log('Sample data inserted successfully');
    return { success: true };

  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
};