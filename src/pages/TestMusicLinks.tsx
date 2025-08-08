import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TestMusicLinks = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const testQueries = async () => {
      try {
        console.log('Testing music_links queries...');
        
        // Test 1: Try to select from music_links table
        console.log('Test 1: Checking if music_links table exists');
        const { data: musicLinksData, error: musicLinksError } = await supabase
          .from('music_links')
          .select('*')
          .limit(5);
        
        if (musicLinksError) {
          console.error('Music links error:', musicLinksError);
          setError(`Music links table error: ${musicLinksError.message}`);
        } else {
          console.log('Music links data:', musicLinksData);
          setTestResults(prev => [...prev, { test: 'music_links_direct', data: musicLinksData }]);
        }

        // Test 2: Try the profiles query with music_links join
        console.log('Test 2: Testing profiles with music_links join');
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id, 
            display_name,
            music_links(service, url, display_name)
          `)
          .limit(3);
        
        if (profilesError) {
          console.error('Profiles join error:', profilesError);
          setError(prev => prev + ` | Profiles join error: ${profilesError.message}`);
        } else {
          console.log('Profiles with music_links:', profilesData);
          setTestResults(prev => [...prev, { test: 'profiles_join', data: profilesData }]);
        }

        // Test 3: Check profiles table structure
        console.log('Test 3: Checking profiles table');
        const { data: profilesOnly, error: profilesOnlyError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .limit(3);
        
        if (profilesOnlyError) {
          console.error('Profiles only error:', profilesOnlyError);
        } else {
          console.log('Profiles only:', profilesOnly);
          setTestResults(prev => [...prev, { test: 'profiles_only', data: profilesOnly }]);
        }
        
      } catch (err: any) {
        console.error('Test error:', err);
        setError(`Test error: ${err.message}`);
      }
    };

    testQueries();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Music Links Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold">{result.test}</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestMusicLinks;