import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Music2, Users, CalendarDays, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitch } from "@/components/LanguageSwitch";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session, loading: authLoading } = useAuth();

  // Remove automatic redirect - let users access homepage when logged in
  // useEffect(() => {
  //   if (!authLoading && session) {
  //     navigate('/discover');
  //   }
  // }, [navigate, session, authLoading]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a href="#" className="font-bold text-lg tracking-tight">FindmyJam</a>
           <nav className="hidden md:flex items-center gap-6 text-sm">
             <a href="#features" className="hover:text-primary transition-colors">{t('features')}</a>
             <a href="#how" className="hover:text-primary transition-colors">{t('howItWorks')}</a>
             <a href="#faq" className="hover:text-primary transition-colors">{t('faq')}</a>
             {!session && <a href="/auth" className="hover:text-primary transition-colors">{t('login')}</a>}
           </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitch />
            {!session && (
              <Button variant="ghost" className="hidden md:inline-flex" asChild>
                <a href="#how">{t('learnMore')}</a>
              </Button>
            )}
            {session ? (
              <Button variant="hero" size="lg" onClick={() => navigate('/discover')}>
                Go to Discover
              </Button>
            ) : (
              <Button variant="hero" size="lg" onClick={() => navigate('/discover')}>
                {t('getStarted')}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="container mx-auto grid md:grid-cols-2 gap-10 items-center px-4 py-16 md:py-24">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                {t('landingTitle')} <span className="text-gradient-primary">{t('findYourJam')}</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-prose">
                {t('landingSubtitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="hero" size="xl" onClick={() => navigate('/discover')}>
                  {session ? 'Continue to Discover' : t('findMyJam')}
                </Button>
                {session && (
                  <Button variant="secondary" size="xl" onClick={() => navigate('/connections')}>
                    View Connections
                  </Button>
                )}
                {!session && (
                  <Button variant="secondary" size="xl" asChild>
                    <a href="#features">{t('exploreFeatures')}</a>
                  </Button>
                )}
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="opacity-70" />
                <span>{t('smartMatching')}</span>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/findmyjam-og.jpg"
                alt="Abstract vibrant music waveforms representing FindmyJam matching"
                className="w-full rounded-xl border border-border shadow-elegant"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24 border-t border-border/60">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('features')}</h2>
              <p className="text-muted-foreground">{t('featuresSubtitle')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <article className="rounded-xl border border-border bg-card p-6 shadow-elegant transition-all hover:-translate-y-1 hover:shadow-glow">
                <Music2 className="mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t('genreMatchingTitle')}</h3>
                <p className="text-muted-foreground">{t('genreMatchingDesc')}</p>
              </article>
              <article className="rounded-xl border border-border bg-card p-6 shadow-elegant transition-all hover:-translate-y-1 hover:shadow-glow">
                <Users className="mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t('verifiedProfilesTitle')}</h3>
                <p className="text-muted-foreground">{t('verifiedProfilesDesc')}</p>
              </article>
              <article className="rounded-xl border border-border bg-card p-6 shadow-elegant transition-all hover:-translate-y-1 hover:shadow-glow">
                <CalendarDays className="mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t('sessionSchedulingTitle')}</h3>
                <p className="text-muted-foreground">{t('sessionSchedulingDesc')}</p>
              </article>
            </div>
          </div>
        </section>

        <section id="how" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('howItWorks')}</h2>
              <p className="text-muted-foreground">{t('howItWorksSubtitle')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-sm font-semibold text-primary mb-2">{t('step1')}</div>
                <h3 className="font-semibold mb-2">{t('createProfileTitle')}</h3>
                <p className="text-muted-foreground">{t('createProfileDesc')}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-sm font-semibold text-primary mb-2">{t('step2')}</div>
                <h3 className="font-semibold mb-2">{t('getMatchedTitle')}</h3>
                <p className="text-muted-foreground">{t('getMatchedDesc')}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-sm font-semibold text-primary mb-2">Step 3</div>
                <h3 className="font-semibold mb-2">Book a jam</h3>
                <p className="text-muted-foreground">Message, schedule, and play. It’s that easy.</p>
              </div>
            </div>
            <div id="get-started" className="mt-10 flex justify-center">
              <Button variant="hero" size="lg" onClick={() => navigate('/discover')}>
                {t('startNow')}
              </Button>
            </div>
          </div>
        </section>

        <section id="faq" className="py-16 md:py-24 border-t border-border/60">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">{t('faq')}</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>{t('freeQuestion')}</AccordionTrigger>
                <AccordionContent>
                  {t('freeAnswer')}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>{t('locationQuestion')}</AccordionTrigger>
                <AccordionContent>
                  {t('locationAnswer')}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>What instruments and genres are supported?</AccordionTrigger>
                <AccordionContent>
                  From guitars to synths and jazz to metal—add any instrument or style and we’ll match accordingly.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{t('copyright', { year: new Date().getFullYear() })}</p>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-primary transition-colors">{t('features')}</a>
            <a href="#how" className="hover:text-primary transition-colors">{t('howItWorks')}</a>
            <a href="#faq" className="hover:text-primary transition-colors">{t('faq')}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Index;
