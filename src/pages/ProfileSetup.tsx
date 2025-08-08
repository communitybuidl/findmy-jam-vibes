import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { X, Plus, ExternalLink, ArrowLeft } from 'lucide-react';

const GENRES = [
  'rock', 'jazz', 'blues', 'pop', 'hip-hop', 'r&b', 'country', 'folk', 
  'electronic', 'classical', 'indie', 'alternative', 'punk', 'metal',
  'reggae', 'funk', 'soul', 'acoustic', 'ambient', 'techno'
];

const ROLES = [
  'musician', 'vocalist', 'guitarist', 'bassist', 'drummer', 'pianist', 
  'songwriter', 'producer', 'artist', 'performer', 'custom'
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';
  
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState<Array<{service: string, url: string, display_name: string}>>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('ProfileSetup: Checking authentication...');
      
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.log('ProfileSetup: No session, redirecting to auth');
        navigate('/auth');
        return;
      }

      console.log('ProfileSetup: User authenticated:', data.session.user.id);
      setCurrentUser(data.session.user);
      
      // Pre-fill display name from OAuth data if available
      const name = data.session.user.user_metadata?.full_name || 
                  data.session.user.user_metadata?.name ||
                  data.session.user.email?.split('@')[0] || '';
      
      console.log('ProfileSetup: Pre-filling name:', name);
      setDisplayName(name);

      // Check if profile exists and load data
      console.log('ProfileSetup: Checking existing profile...');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, display_name, role, genres, location, city, country')
        .eq('user_id', data.session.user.id)
        .single();

      if (error) {
        console.log('ProfileSetup: No existing profile or error:', error.message);
      } else {
        console.log('ProfileSetup: Existing profile:', profile);
        
        // Pre-populate form with existing data when editing
        if (profile && isEditing) {
          setDisplayName(profile.display_name || name);
          setRole(profile.role || '');
          setSelectedGenres(profile.genres || []);
          setLocation(profile.location || '');
          setCity(profile.city || '');
          setCountry(profile.country || '');
        }
      }

      // Only redirect if profile is complete AND we're not in edit mode
      if (profile && profile.display_name && profile.role && profile.genres?.length && !isEditing) {
        console.log('ProfileSetup: Profile complete, redirecting to discover');
        navigate('/discover');
      } else {
        console.log('ProfileSetup: Staying on setup page');
      }

      // Load portfolio links if we have a profile
      if (profile?.id) {
        const { data: musicLinks } = await supabase
          .from('music_links')
          .select('service, url, display_name')
          .eq('profile_id', profile.id);
        
        if (musicLinks) {
          setPortfolioLinks(musicLinks);
        }
      }
    };

    checkAuth();
  }, [navigate, isEditing]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleAddCustomGenre = () => {
    if (customGenre.trim() && !selectedGenres.includes(customGenre.trim().toLowerCase())) {
      setSelectedGenres(prev => [...prev, customGenre.trim().toLowerCase()]);
      setCustomGenre('');
    }
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    if (selectedRole !== 'custom') {
      setCustomRole('');
    }
  };

  const handleAddPortfolioLink = () => {
    setPortfolioLinks(prev => [...prev, { service: '', url: '', display_name: '' }]);
  };

  const handlePortfolioLinkChange = (index: number, field: string, value: string) => {
    setPortfolioLinks(prev => 
      prev.map((link, i) => i === index ? { ...link, [field]: value } : link)
    );
  };

  const handleRemovePortfolioLink = (index: number) => {
    setPortfolioLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = role === 'custom' ? customRole.trim() : role;
    
    if (!displayName.trim() || !finalRole || selectedGenres.length === 0) {
      toast({
        title: 'Please fill in all fields',
        description: 'Display name, role, and at least one genre are required.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: 'Authentication Error',
        description: 'Please sign in again.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      console.log('Updating profile for user:', currentUser.id);
      console.log('Profile data:', { displayName, finalRole, selectedGenres, portfolioLinks });

      // First, ensure profile exists
      await supabase.rpc('ensure_profile');

      // Then update the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          role: finalRole,
          genres: selectedGenres,
          location: location.trim() || null,
          city: city.trim() || null,
          country: country.trim() || null,
        })
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      console.log('Profile updated successfully:', profileData);

      // Update music links
      if (portfolioLinks.length > 0) {
        // First delete existing links
        await supabase
          .from('music_links')
          .delete()
          .eq('profile_id', profileData.id);

        // Insert new links
        const validLinks = portfolioLinks.filter(link => 
          link.service.trim() && link.url.trim() && link.display_name.trim()
        );

        if (validLinks.length > 0) {
          const { error: linksError } = await supabase
            .from('music_links')
            .insert(
              validLinks.map(link => ({
                profile_id: profileData.id,
                service: link.service.trim(),
                url: link.url.trim(),
                display_name: link.display_name.trim(),
              }))
            );

          if (linksError) {
            console.error('Music links error:', linksError);
            // Don't throw - profile was saved successfully
          }
        }
      }

      toast({
        title: isEditing ? 'Profile updated!' : 'Profile created!',
        description: isEditing ? 'Your profile has been updated successfully.' : 'Welcome to FindmyJam! Start discovering musicians.',
      });

      // Small delay to ensure the toast is seen
      setTimeout(() => {
        navigate('/discover');
      }, 1000);

    } catch (error: any) {
      console.error('Profile creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Set up your profile | FindmyJam</title>
        <meta name="description" content="Complete your musician profile to start connecting." />
      </Helmet>

      <main>
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/discover')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Discover
              </Button>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {isEditing ? 'Edit your profile' : 'Complete your profile'}
              </h1>
              <p className="text-muted-foreground">
                Tell other musicians about your style and role
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Musician Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="How you want to be known"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Primary Role *</Label>
                    <Select value={role} onValueChange={handleRoleSelect} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r === 'custom' ? 'Custom Role' : r.charAt(0).toUpperCase() + r.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {role === 'custom' && (
                      <Input
                        placeholder="Enter your custom role"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        className="mt-2"
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Genres * (select all that apply)</Label>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleGenreToggle(genre)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors ${
                            selectedGenres.includes(genre)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:bg-accent'
                          }`}
                        >
                          {genre}
                          {selectedGenres.includes(genre) && (
                            <X className="h-3 w-3" />
                          )}
                        </button>
                      ))}
                    </div>
                    {selectedGenres.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedGenres.join(', ')}
                      </p>
                    )}
                    
                    {/* Custom genre input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom genre"
                        value={customGenre}
                        onChange={(e) => setCustomGenre(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomGenre())}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomGenre}
                        size="sm"
                        disabled={!customGenre.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Location Section */}
                  <div className="space-y-3">
                    <Label>Location (Optional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="city" className="text-sm text-muted-foreground">City</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g., New York"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-sm text-muted-foreground">Country</Label>
                        <Input
                          id="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="e.g., United States"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-sm text-muted-foreground">Area/Region</Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g., Manhattan, Brooklyn"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      💡 Adding your location helps other musicians find you nearby
                    </p>
                  </div>

                  {/* Portfolio Links Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Portfolio Links (Optional)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddPortfolioLink}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Link
                      </Button>
                    </div>
                    
                    {portfolioLinks.map((link, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Platform</Label>
                            <Input
                              placeholder="e.g., Spotify, Instagram"
                              value={link.service}
                              onChange={(e) => handlePortfolioLinkChange(index, 'service', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Display Name</Label>
                            <Input
                              placeholder="e.g., My Music"
                              value={link.display_name}
                              onChange={(e) => handlePortfolioLinkChange(index, 'display_name', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">URL</Label>
                            <Input
                              placeholder="https://..."
                              value={link.url}
                              onChange={(e) => handlePortfolioLinkChange(index, 'url', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePortfolioLink(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {portfolioLinks.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        💡 These links will be clickable on your profile and open in new tabs
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (isEditing ? 'Updating profile...' : 'Creating profile...') : (isEditing ? 'Update profile' : 'Complete setup')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfileSetup;