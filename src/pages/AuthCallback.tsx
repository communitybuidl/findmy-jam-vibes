import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=oauth_failed');
          return;
        }

        if (data.session) {
          // Check if profile exists and is complete
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, role, genres')
            .eq('user_id', data.session.user.id)
            .single();

          // If no profile or incomplete profile, go to setup
          if (!profile || !profile.display_name || !profile.role || !profile.genres?.length) {
            navigate('/profile-setup', { replace: true });
          } else {
            const redirectTo = searchParams.get('redirect') || '/discover';
            navigate(redirectTo, { replace: true });
          }
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth?error=oauth_failed');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;