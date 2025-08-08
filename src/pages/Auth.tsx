import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Chrome } from "lucide-react";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const canonical = useMemo(() => (typeof window !== "undefined" ? window.location.href : ""), []);

  useEffect(() => {
    // If user is already logged in, redirect to discover
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const backTo = params.get("redirect") || "/discover";
        navigate(backTo, { replace: true });
      }
    });

    // Handle OAuth callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Check if profile exists and is complete
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, role, genres')
            .eq('user_id', session.user.id)
            .single();

          // If no profile or incomplete profile, go to setup
          if (!profile || !profile.display_name || !profile.role || !profile.genres?.length) {
            navigate('/profile-setup', { replace: true });
          } else {
            const backTo = params.get("redirect") || "/discover";
            navigate(backTo, { replace: true });
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignup) {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        navigate("/", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const backTo = params.get("redirect") || "/discover";
        navigate(backTo, { replace: true });
      }
    } catch (err: Error) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const backTo = params.get("redirect") || "/discover";
      // Use the auth callback route for proper OAuth handling
      const redirectUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(backTo)}`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      
      if (error) throw error;
    } catch (err: Error) {
      setError(err?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{isSignup ? "Create your FindmyJam account" : "Log in to FindmyJam"}</title>
        <meta name="description" content="Log in or sign up to connect with musicians on FindmyJam." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <main>
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-md">
            <h1 className="text-3xl font-bold mb-6 text-center">{isSignup ? "Sign up" : "Log in"}</h1>
            <div className="rounded-xl border border-border bg-card p-6 shadow-elegant">
              {/* Google Login Button */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mb-4" 
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Chrome className="h-4 w-4 mr-2" />
                Continue with Google
              </Button>
              
              <div className="relative mb-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  or
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                {isSignup ? (
                  <button className="text-primary underline" onClick={() => setIsSignup(false)}>Have an account? Log in</button>
                ) : (
                  <button className="text-primary underline" onClick={() => setIsSignup(true)}>New here? Create an account</button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Auth;
