import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Music2, Users, CalendarDays, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a href="#" className="font-bold text-lg tracking-tight">FindmyJam</a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how" className="hover:text-primary transition-colors">How it works</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="hidden md:inline-flex" asChild>
              <a href="#how">Learn more</a>
            </Button>
            <Button variant="hero" size="lg" asChild>
              <a href="#get-started">Get started</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="container mx-auto grid md:grid-cols-2 gap-10 items-center px-4 py-16 md:py-24">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                Meet musicians. Match fast. <span className="text-gradient-primary">Find your jam.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-prose">
                FindmyJam connects you with nearby players by genre, instrument and skill level. Book sessions, build bands, and make music together.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="hero" size="xl" asChild>
                  <a href="#get-started">Find my jam</a>
                </Button>
                <Button variant="secondary" size="xl" asChild>
                  <a href="#features">Explore features</a>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="opacity-70" />
                <span>Smart matching • Verified profiles • Session scheduling</span>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Features</h2>
              <p className="text-muted-foreground">Designed to help you connect and play more.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <article className="rounded-xl border border-border bg-card p-6 shadow-elegant transition-all hover:-translate-y-1 hover:shadow-glow">
                <Music2 className="mb-4" />
                <h3 className="font-semibold text-lg mb-2">Genre & instrument matching</h3>
                <p className="text-muted-foreground">Filter by styles, instruments and proficiency to discover the right collaborators.</p>
              </article>
              <article className="rounded-xl border border-border bg-card p-6 shadow-elegant transition-all hover:-translate-y-1 hover:shadow-glow">
                <Users className="mb-4" />
                <h3 className="font-semibold text-lg mb-2">Verified profiles</h3>
                <p className="text-muted-foreground">Trustworthy musician profiles with media, influences and availability.</p>
              </article>
              <article className="rounded-xl border border-border bg-card p-6 shadow-elegant transition-all hover:-translate-y-1 hover:shadow-glow">
                <CalendarDays className="mb-4" />
                <h3 className="font-semibold text-lg mb-2">Session scheduling</h3>
                <p className="text-muted-foreground">Book rehearsal rooms or set up home jams with shared calendars and reminders.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="how" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">How it works</h2>
              <p className="text-muted-foreground">Three simple steps to your next jam session.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-sm font-semibold text-primary mb-2">Step 1</div>
                <h3 className="font-semibold mb-2">Create your profile</h3>
                <p className="text-muted-foreground">Add instruments, genres, influences and availability.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-sm font-semibold text-primary mb-2">Step 2</div>
                <h3 className="font-semibold mb-2">Get matched</h3>
                <p className="text-muted-foreground">Our smart matching suggests compatible musicians nearby.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-sm font-semibold text-primary mb-2">Step 3</div>
                <h3 className="font-semibold mb-2">Book a jam</h3>
                <p className="text-muted-foreground">Message, schedule, and play. It’s that easy.</p>
              </div>
            </div>
            <div id="get-started" className="mt-10 flex justify-center">
              <Button variant="hero" size="lg">Start now</Button>
            </div>
          </div>
        </section>

        <section id="faq" className="py-16 md:py-24 border-t border-border/60">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">FAQs</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is FindmyJam free?</AccordionTrigger>
                <AccordionContent>
                  Yes, the core features are free while we experiment with upgrades for power users.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Do I need to share my location?</AccordionTrigger>
                <AccordionContent>
                  Location helps you find nearby matches; you control visibility and can browse broadly.
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
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} FindmyJam. All rights reserved.</p>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how" className="hover:text-primary transition-colors">How it works</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Index;
