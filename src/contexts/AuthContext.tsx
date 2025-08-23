import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Subscribe FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (!mounted) return;
      
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false); // Set loading to false on any auth state change
      
      // Only ensure profile exists (don't auto-complete it)
      if (event === 'SIGNED_IN' && sess?.user) {
        try {
          // Check if profile already exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, display_name')
            .eq('user_id', sess.user.id)
            .single();
          
          // Only create minimal profile if none exists
          if (!existingProfile) {
            await supabase.rpc('ensure_profile');
          }
        } catch (error) {
          console.error('Error ensuring profile:', error);
        }
      }
    });

    // THEN get existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
