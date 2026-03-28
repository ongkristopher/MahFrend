import Link from 'next/link';
import {
  ArrowRight,
  HandCoins,
  CalendarCheck,
  ShieldCheck,
  ChevronDown,
  Users,
  BarChart3,
  Wallet,
  Clock,
  Star,
  Smartphone,
} from 'lucide-react';

function FAQItem({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-b border-border last:border-0">
      <summary className="flex items-center justify-between cursor-pointer py-5 text-headline-sm text-on-surface">
        {question}
        <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-5 text-body-lg text-muted-foreground space-y-4">
        {children}
      </div>
    </details>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="glass sticky top-0 z-50 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-headline-md text-on-surface">MahFrend</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-body-md text-muted-foreground hover:text-on-surface transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center h-10 px-5 rounded-lg bg-[#3b8a6e] hover:bg-[#327a60] text-white text-body-md font-medium transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-[#565e74] via-[#4a5268] to-[#3b8a6e]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-8">
            <Star className="w-4 h-4 text-[#c4850c]" />
            Free forever — no hidden fees
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight tracking-tight">
            Lend to friends and family — without the awkwardness
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
            We know how it feels — you want to help someone you care about,
            but following up on payments can get uncomfortable. MahFrend takes
            care of the tracking so you never have to be the one chasing.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-13 px-8 rounded-xl bg-white text-[#565e74] font-semibold hover:bg-white/90 transition-colors shadow-lg"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center h-13 px-8 rounded-xl bg-white/10 backdrop-blur-sm text-white font-medium border border-white/20 hover:bg-white/20 transition-colors"
            >
              See what&apos;s included
            </a>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 59" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#f7f9fb" />
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-5xl mx-auto px-6 mb-16">
        <div className="bg-surface-lowest rounded-2xl border border-border shadow-sm p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#3b8a6e]">100%</p>
            <p className="text-body-md text-muted-foreground mt-1">Free to use</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#565e74]">24/7</p>
            <p className="text-body-md text-muted-foreground mt-1">Always available</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#c4850c]">Auto</p>
            <p className="text-body-md text-muted-foreground mt-1">Penalty tracking</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#9f403d]">Real-time</p>
            <p className="text-body-md text-muted-foreground mt-1">Balance updates</p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-linear-to-br from-[#3b8a6e]/5 via-surface-lowest to-[#565e74]/5 rounded-3xl border border-border p-10 md:p-14">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-label-md text-[#3b8a6e] mb-3">Why We Built This</p>
            <h2 className="text-display-md text-on-surface">
              Because money shouldn&apos;t make things weird between friends
            </h2>
            <p className="mt-5 text-body-lg text-muted-foreground leading-relaxed">
              You lent money because you wanted to help — not because you wanted
              a second job tracking payments. And your borrower didn&apos;t mean
              to forget, they just lost track. MahFrend keeps both sides
              organized so nobody has to send that awkward &ldquo;hey, just
              following up...&rdquo; message ever again.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#3b8a6e]/10 flex items-center justify-center mx-auto mb-4">
                <HandCoins className="w-6 h-6 text-[#3b8a6e]" />
              </div>
              <h3 className="text-headline-sm text-on-surface">For you, the lender</h3>
              <p className="mt-2 text-body-md text-muted-foreground">
                Stop keeping mental tabs on who owes what. Everything&apos;s in
                one place — loans, schedules, collections — so you can help
                people without the headache.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#565e74]/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-[#565e74]" />
              </div>
              <h3 className="text-headline-sm text-on-surface">For your borrowers</h3>
              <p className="mt-2 text-body-md text-muted-foreground">
                They&apos;ll always know exactly what they owe, when it&apos;s
                due, and how much is left. No more &ldquo;I forgot&rdquo;
                moments — just a clear, friendly schedule.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#c4850c]/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-[#c4850c]" />
              </div>
              <h3 className="text-headline-sm text-on-surface">For the friendship</h3>
              <p className="mt-2 text-body-md text-muted-foreground">
                When everything&apos;s written down, there&apos;s nothing to
                argue about. No awkward reminders, no guessing — just trust
                and transparency between people who care about each other.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <p className="text-label-md text-[#3b8a6e] mb-3">Features</p>
          <h2 className="text-display-md text-on-surface">
            All the tools, none of the stress
          </h2>
          <p className="mt-4 text-body-lg text-muted-foreground max-w-xl mx-auto">
            From the moment you lend to the day it&apos;s fully paid back,
            MahFrend handles the bookkeeping so you can focus on being a good
            friend.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-surface-lowest rounded-xl p-7 border border-border hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-lg bg-[#3b8a6e]/10 flex items-center justify-center mb-4">
              <HandCoins className="w-5 h-5 text-[#3b8a6e]" />
            </div>
            <h3 className="text-headline-sm text-on-surface">Loan Tracking</h3>
            <p className="mt-2 text-body-md text-muted-foreground">
              Set up a loan in seconds — amount, interest, how long, and how
              often they pay. It&apos;s as easy as filling out a short form.
            </p>
          </div>
          <div className="bg-surface-lowest rounded-xl p-7 border border-border hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-lg bg-[#565e74]/10 flex items-center justify-center mb-4">
              <CalendarCheck className="w-5 h-5 text-[#565e74]" />
            </div>
            <h3 className="text-headline-sm text-on-surface">
              Payment Schedules
            </h3>
            <p className="mt-2 text-body-md text-muted-foreground">
              Payment dates are generated for you automatically. A friendly
              calendar shows what&apos;s coming up, what&apos;s been paid, and
              what needs attention.
            </p>
          </div>
          <div className="bg-surface-lowest rounded-xl p-7 border border-border hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-lg bg-[#c4850c]/10 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-[#c4850c]" />
            </div>
            <h3 className="text-headline-sm text-on-surface">
              Penalty Management
            </h3>
            <p className="mt-2 text-body-md text-muted-foreground">
              Late payments? Set fair rules upfront — grace periods, penalty
              type, and frequency — so everyone knows the deal from day one.
              No surprises.
            </p>
          </div>
          <div className="bg-surface-lowest rounded-xl p-7 border border-border hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-lg bg-[#9f403d]/10 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-[#9f403d]" />
            </div>
            <h3 className="text-headline-sm text-on-surface">
              Borrower Profiles
            </h3>
            <p className="mt-2 text-body-md text-muted-foreground">
              Keep your borrowers&apos; info in one spot — contact details,
              loan history, and a handy payor score so you know who&apos;s
              reliable at a glance.
            </p>
          </div>
          <div className="bg-surface-lowest rounded-xl p-7 border border-border hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-lg bg-[#6366f1]/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-[#6366f1]" />
            </div>
            <h3 className="text-headline-sm text-on-surface">
              Dashboard Analytics
            </h3>
            <p className="mt-2 text-body-md text-muted-foreground">
              Your personal lending dashboard — see how much you&apos;ve lent,
              what you&apos;ve earned, and how collections are going this
              month. All at a glance.
            </p>
          </div>
          <div className="bg-surface-lowest rounded-xl p-7 border border-border hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-lg bg-[#0891b2]/10 flex items-center justify-center mb-4">
              <Wallet className="w-5 h-5 text-[#0891b2]" />
            </div>
            <h3 className="text-headline-sm text-on-surface">
              Capital Management
            </h3>
            <p className="mt-2 text-body-md text-muted-foreground">
              Decide how much you&apos;re comfortable lending total, and the
              app keeps track of what&apos;s available. No more accidentally
              over-committing.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-linear-to-b from-surface-low to-surface border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-label-md text-[#565e74] mb-3">How It Works</p>
            <h2 className="text-display-md text-on-surface">
              Up and running in minutes
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#3b8a6e] text-white flex items-center justify-center mx-auto mb-5 text-xl font-bold shadow-lg shadow-[#3b8a6e]/20">
                1
              </div>
              <h3 className="text-headline-sm text-on-surface">Sign Up</h3>
              <p className="mt-2 text-body-md text-muted-foreground">
                Quick and free — just your email or Google account. You&apos;ll
                be in before your coffee gets cold.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#565e74] text-white flex items-center justify-center mx-auto mb-5 text-xl font-bold shadow-lg shadow-[#565e74]/20">
                2
              </div>
              <h3 className="text-headline-sm text-on-surface">Set Your Budget</h3>
              <p className="mt-2 text-body-md text-muted-foreground">
                Tell us how much you&apos;re comfortable lending overall.
                We&apos;ll make sure you never go over.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#c4850c] text-white flex items-center justify-center mx-auto mb-5 text-xl font-bold shadow-lg shadow-[#c4850c]/20">
                3
              </div>
              <h3 className="text-headline-sm text-on-surface">Create a Loan</h3>
              <p className="mt-2 text-body-md text-muted-foreground">
                Add your friend, set the terms, and boom — payment schedules
                are ready. Both of you know exactly what to expect.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#9f403d] text-white flex items-center justify-center mx-auto mb-5 text-xl font-bold shadow-lg shadow-[#9f403d]/20">
                4
              </div>
              <h3 className="text-headline-sm text-on-surface">Sit Back</h3>
              <p className="mt-2 text-body-md text-muted-foreground">
                Record payments as they come in — balances and penalties update
                automatically. No chasing needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Highlights */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-label-md text-[#c4850c] mb-3">Smart Scheduling</p>
            <h3 className="text-headline-lg text-on-surface">
              Your calendar does the reminding for you
            </h3>
            <p className="mt-4 text-body-lg text-muted-foreground">
              No need to text your friend &ldquo;hey, just checking in about
              the payment.&rdquo; The calendar shows everything at a glance —
              color-coded so you instantly see what&apos;s paid, what&apos;s
              coming up, and what&apos;s overdue. The app remembers so you
              don&apos;t have to.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3b8a6e]/10 text-[#3b8a6e] text-sm font-medium">
                <Clock className="w-3.5 h-3.5" /> On-time tracking
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#c4850c]/10 text-[#c4850c] text-sm font-medium">
                <CalendarCheck className="w-3.5 h-3.5" /> Approaching alerts
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#9f403d]/10 text-[#9f403d] text-sm font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Overdue detection
              </span>
            </div>
          </div>
          <div className="bg-linear-to-br from-[#565e74]/5 to-[#3b8a6e]/5 rounded-2xl border border-border p-6">
            {/* Mini calendar mockup */}
            <div className="bg-surface-lowest rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-on-surface">March 2026</p>
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded bg-surface-low flex items-center justify-center">
                    <ChevronDown className="w-3 h-3 text-muted-foreground rotate-90" />
                  </div>
                  <div className="w-6 h-6 rounded bg-surface-low flex items-center justify-center">
                    <ChevronDown className="w-3 h-3 text-muted-foreground -rotate-90" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-1">
                {['M','T','W','T','F','S','S'].map((d,i) => <span key={i}>{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {[23,24,25,26,27,28,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29].map((d,i) => (
                  <div key={i} className={`py-1.5 rounded flex flex-col items-center gap-0.5 ${i < 6 ? 'opacity-30' : ''} ${d === 17 && i >= 6 ? 'bg-primary text-white' : ''}`}>
                    <span className="leading-none">{d}</span>
                    {d === 1 && i >= 6 && <div className="flex gap-px"><span className="w-1 h-1 rounded-full bg-[#3b8a6e]" /></div>}
                    {d === 15 && i >= 6 && <div className="flex gap-px"><span className="w-1 h-1 rounded-full bg-muted-foreground" /><span className="w-1 h-1 rounded-full bg-[#3b8a6e]" /></div>}
                    {d === 17 && i >= 6 && <div className="flex gap-px"><span className="w-1 h-1 rounded-full bg-white" /></div>}
                    {d === 20 && i >= 6 && <div className="flex gap-px"><span className="w-1 h-1 rounded-full bg-[#c4850c]" /></div>}
                    {d === 28 && i >= 6 && i > 6 && <div className="flex gap-px"><span className="w-1 h-1 rounded-full bg-[#9f403d]" /></div>}
                  </div>
                ))}
              </div>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4 px-1">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-[#3b8a6e]" />On Time</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-[#c4850c]" />Upcoming</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-[#9f403d]" />Overdue</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />Paid</span>
            </div>
            {/* Selected date events */}
            <p className="text-label-sm text-muted-foreground mb-2 px-1">March 17, 2026</p>
            <div className="bg-surface-lowest rounded-lg overflow-hidden border border-border">
              <div className="flex">
                <div className="w-1 shrink-0 bg-[#c4850c]" />
                <div className="flex-1 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">P1,800 · Maria Santos</p>
                    <p className="text-xs text-muted-foreground">Due in 3 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center mt-24">
          <div className="order-2 md:order-1 bg-linear-to-br from-[#c4850c]/5 to-[#9f403d]/5 rounded-2xl border border-border p-6">
            {/* Borrower list mockup */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-on-surface">Borrowers</p>
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-surface-lowest rounded-lg p-3.5 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#3b8a6e]/10 flex items-center justify-center text-sm font-semibold text-[#3b8a6e]">J</div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">Juan dela Cruz</p>
                    <p className="text-xs text-muted-foreground">2 active loans</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-[#3b8a6e] bg-[#3b8a6e]/15 px-1.5 py-0.5 rounded">Good Payor</span>
              </div>
              <div className="bg-surface-lowest rounded-lg p-3.5 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#c4850c]/10 flex items-center justify-center text-sm font-semibold text-[#c4850c]">M</div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">Maria Santos</p>
                    <p className="text-xs text-muted-foreground">1 active loan</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-[#c4850c] bg-[#c4850c]/15 px-1.5 py-0.5 rounded">Fair</span>
              </div>
              <div className="bg-surface-lowest rounded-lg p-3.5 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#9f403d]/10 flex items-center justify-center text-sm font-semibold text-[#9f403d]">P</div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">Pedro Reyes</p>
                    <p className="text-xs text-muted-foreground">1 overdue loan</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-[#9f403d] bg-[#9f403d]/15 px-1.5 py-0.5 rounded">Needs Attention</span>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <p className="text-label-md text-[#6366f1] mb-3">Borrower Insights</p>
            <h3 className="text-headline-lg text-on-surface">
              See who&apos;s keeping their word
            </h3>
            <p className="mt-4 text-body-lg text-muted-foreground">
              Every borrower gets a payor score based on their history. It&apos;s
              not about judging — it&apos;s about knowing. Next time someone
              asks for a loan, you&apos;ll have the info to say yes (or no)
              with confidence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3b8a6e]/10 text-[#3b8a6e] text-sm font-medium">
                <Star className="w-3.5 h-3.5" /> Payor scoring
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6366f1]/10 text-[#6366f1] text-sm font-medium">
                <Users className="w-3.5 h-3.5" /> Contact management
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0891b2]/10 text-[#0891b2] text-sm font-medium">
                <BarChart3 className="w-3.5 h-3.5" /> Loan history
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-friendly callout */}
      <section className="bg-linear-to-r from-[#565e74] to-[#3b8a6e]">
        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-headline-lg text-white">Use it anywhere, on any device</h3>
            <p className="mt-2 text-body-lg text-white/80">
              Check on your loans from your phone while you&apos;re out, or
              from your laptop at home. MahFrend looks great on any screen —
              it goes where you go.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#565e74] via-[#4a5268] to-[#3b8a6e] p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Ready to lend without the stress?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-lg mx-auto">
              Help the people you care about — and keep your peace of mind.
              MahFrend is free, takes minutes to set up, and makes lending feel
              easy again.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 mt-8 h-13 px-8 rounded-xl bg-white text-[#565e74] font-semibold hover:bg-white/90 transition-colors shadow-lg"
            >
              Create your free account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-surface-lowest border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <h2 className="text-display-md text-on-surface text-center mb-12">
            Frequently Asked Questions
          </h2>

          <FAQItem question="What is MahFrend?">
            <p>
              MahFrend is a lending management app designed for people who lend
              money to friends and family. It helps you keep track of who owes
              what, when payments are due, and how much has been collected — so
              you don&apos;t have to rely on memory or messy spreadsheets.
            </p>
          </FAQItem>

          <FAQItem question="How do penalties work?">
            <p>
              When a borrower misses a payment due date, a penalty can be
              applied. You configure penalty rules per loan under{' '}
              <strong>Late Payment Rules</strong>. There are four settings:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Grace Period</strong> — Days after the due date before
                the penalty kicks in. For example, a 7-day grace period on a
                March 1 due date means no penalty until March 9.
              </li>
              <li>
                <strong>Penalty Type</strong> — Either a{' '}
                <strong>percentage</strong> of the payment amount, or a{' '}
                <strong>fixed fee</strong>.
              </li>
              <li>
                <strong>Penalty Rate</strong> — The value used. If percentage,
                5 means 5%. If fixed, 100 means 100 pesos.
              </li>
              <li>
                <strong>Penalty Frequency</strong> — How often it accumulates:{' '}
                <strong>daily</strong>, <strong>monthly</strong>, or{' '}
                <strong>one-time</strong>.
              </li>
            </ul>
          </FAQItem>

          <FAQItem question="Can you show me an example of how penalties are calculated?">
            <p>
              Sure! Suppose a scheduled payment of <strong>1,000 pesos</strong>{' '}
              is due on <strong>March 1</strong>, the grace period is{' '}
              <strong>7 days</strong>, and the borrower still hasn&apos;t paid by{' '}
              <strong>March 21</strong> — that&apos;s 13 days late after the
              grace period. Here&apos;s what the penalty would be:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface-low text-on-surface">
                    <th className="text-left px-4 py-3 font-semibold">Setup</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Calculation
                    </th>
                    <th className="text-right px-4 py-3 font-semibold">
                      Penalty
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">5% daily</td>
                    <td className="px-4 py-3">1,000 x 5% x 13 days</td>
                    <td className="px-4 py-3 text-right font-medium">650</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">5% monthly</td>
                    <td className="px-4 py-3">1,000 x 5% x 1 month</td>
                    <td className="px-4 py-3 text-right font-medium">50</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">5% one-time</td>
                    <td className="px-4 py-3">1,000 x 5%</td>
                    <td className="px-4 py-3 text-right font-medium">50</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">100 fixed daily</td>
                    <td className="px-4 py-3">100 x 13 days</td>
                    <td className="px-4 py-3 text-right font-medium">1,300</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">100 fixed monthly</td>
                    <td className="px-4 py-3">100 x 1 month</td>
                    <td className="px-4 py-3 text-right font-medium">100</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">100 fixed one-time</td>
                    <td className="px-4 py-3">100 (flat)</td>
                    <td className="px-4 py-3 text-right font-medium">100</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm">
              Monthly frequency counts partial months as a full month. So 31
              overdue days counts as 2 months, not 1.
            </p>
          </FAQItem>

          <FAQItem question="What if a payment is overdue for 2 months or longer?">
            <p>
              Using the same setup — a scheduled payment of{' '}
              <strong>1,000 pesos</strong> due on <strong>March 1</strong> with a{' '}
              <strong>7-day grace period</strong> — but now the borrower
              hasn&apos;t paid by <strong>May 1</strong>. That&apos;s 54 days
              late after the grace period:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface-low text-on-surface">
                    <th className="text-left px-4 py-3 font-semibold">Setup</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Calculation
                    </th>
                    <th className="text-right px-4 py-3 font-semibold">
                      Penalty
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">5% daily</td>
                    <td className="px-4 py-3">1,000 x 5% x 54 days</td>
                    <td className="px-4 py-3 text-right font-medium">2,700</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">5% monthly</td>
                    <td className="px-4 py-3">1,000 x 5% x 2 months</td>
                    <td className="px-4 py-3 text-right font-medium">100</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">5% one-time</td>
                    <td className="px-4 py-3">1,000 x 5%</td>
                    <td className="px-4 py-3 text-right font-medium">50</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">100 fixed daily</td>
                    <td className="px-4 py-3">100 x 54 days</td>
                    <td className="px-4 py-3 text-right font-medium">5,400</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">100 fixed monthly</td>
                    <td className="px-4 py-3">100 x 2 months</td>
                    <td className="px-4 py-3 text-right font-medium">200</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">100 fixed one-time</td>
                    <td className="px-4 py-3">100 (flat)</td>
                    <td className="px-4 py-3 text-right font-medium">100</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Notice how <strong>daily</strong> penalties grow quickly the longer
              a payment is overdue, while <strong>one-time</strong> stays the
              same no matter how late. <strong>Monthly</strong> sits in between
              — 54 days counts as 2 months since partial months round up.
            </p>
          </FAQItem>

          <FAQItem question="How are penalties computed when multiple payments are overdue?">
            <p>
              Penalties are calculated <strong>per payment schedule</strong>,
              not as a lump sum on the whole loan. Each overdue schedule
              accumulates its own penalty based on how late that specific
              payment is.
            </p>
            <p>
              In all examples below, a borrower has missed 3 consecutive
              payments of <strong>1,000 pesos</strong> each (due Feb 1, Mar 1,
              and Apr 1), with a <strong>7-day grace period</strong>. Today is{' '}
              <strong>May 1</strong>, so the days late after grace are:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Feb 1 payment — <strong>82 days</strong> late after grace</li>
              <li>Mar 1 payment — <strong>54 days</strong> late after grace</li>
              <li>Apr 1 payment — <strong>23 days</strong> late after grace</li>
            </ul>

            {/* Scenario 1: Percentage Daily */}
            <h4 className="font-semibold text-on-surface pt-2">
              Scenario 1: 5% Percentage — Daily
            </h4>
            <p className="text-sm">
              Penalty per schedule = payment amount x 5% x days late
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface-low text-on-surface">
                    <th className="text-left px-4 py-3 font-semibold">Due Date</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">Days Late</th>
                    <th className="text-left px-4 py-3 font-semibold">Calculation</th>
                    <th className="text-right px-4 py-3 font-semibold">Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">Feb 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">82 days</td>
                    <td className="px-4 py-3">1,000 x 5% x 82</td>
                    <td className="px-4 py-3 text-right font-medium">4,100</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Mar 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">54 days</td>
                    <td className="px-4 py-3">1,000 x 5% x 54</td>
                    <td className="px-4 py-3 text-right font-medium">2,700</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Apr 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">23 days</td>
                    <td className="px-4 py-3">1,000 x 5% x 23</td>
                    <td className="px-4 py-3 text-right font-medium">1,150</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-surface-low font-semibold text-on-surface">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">3,000</td>
                    <td className="px-4 py-3" colSpan={2}></td>
                    <td className="px-4 py-3 text-right">7,950</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-sm">
              Total to pay: <strong>10,950 pesos</strong> (3,000 principal +
              7,950 penalties). Daily percentage adds up fast.
            </p>

            {/* Scenario 2: Percentage Monthly */}
            <h4 className="font-semibold text-on-surface pt-2">
              Scenario 2: 5% Percentage — Monthly
            </h4>
            <p className="text-sm">
              Penalty per schedule = payment amount x 5% x months (partial
              months round up)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface-low text-on-surface">
                    <th className="text-left px-4 py-3 font-semibold">Due Date</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">Days Late</th>
                    <th className="text-left px-4 py-3 font-semibold">Months</th>
                    <th className="text-left px-4 py-3 font-semibold">Calculation</th>
                    <th className="text-right px-4 py-3 font-semibold">Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">Feb 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">82 days</td>
                    <td className="px-4 py-3">3</td>
                    <td className="px-4 py-3">1,000 x 5% x 3</td>
                    <td className="px-4 py-3 text-right font-medium">150</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Mar 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">54 days</td>
                    <td className="px-4 py-3">2</td>
                    <td className="px-4 py-3">1,000 x 5% x 2</td>
                    <td className="px-4 py-3 text-right font-medium">100</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Apr 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">23 days</td>
                    <td className="px-4 py-3">1</td>
                    <td className="px-4 py-3">1,000 x 5% x 1</td>
                    <td className="px-4 py-3 text-right font-medium">50</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-surface-low font-semibold text-on-surface">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">3,000</td>
                    <td className="px-4 py-3" colSpan={3}></td>
                    <td className="px-4 py-3 text-right">300</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-sm">
              Total to pay: <strong>3,300 pesos</strong>. 82 days = 3 months
              (rounds up from 2.7), 54 days = 2 months, 23 days = 1 month.
            </p>

            {/* Scenario 3: Percentage One-time */}
            <h4 className="font-semibold text-on-surface pt-2">
              Scenario 3: 5% Percentage — One-time
            </h4>
            <p className="text-sm">
              Penalty per schedule = payment amount x 5% (charged once, no
              matter how late)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface-low text-on-surface">
                    <th className="text-left px-4 py-3 font-semibold">Due Date</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">Days Late</th>
                    <th className="text-left px-4 py-3 font-semibold">Calculation</th>
                    <th className="text-right px-4 py-3 font-semibold">Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">Feb 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">82 days</td>
                    <td className="px-4 py-3">1,000 x 5%</td>
                    <td className="px-4 py-3 text-right font-medium">50</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Mar 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">54 days</td>
                    <td className="px-4 py-3">1,000 x 5%</td>
                    <td className="px-4 py-3 text-right font-medium">50</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Apr 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">23 days</td>
                    <td className="px-4 py-3">1,000 x 5%</td>
                    <td className="px-4 py-3 text-right font-medium">50</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-surface-low font-semibold text-on-surface">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">3,000</td>
                    <td className="px-4 py-3" colSpan={2}></td>
                    <td className="px-4 py-3 text-right">150</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-sm">
              Total to pay: <strong>3,150 pesos</strong>. Each schedule gets a
              flat 50-peso penalty regardless of how long it&apos;s been overdue.
            </p>

            {/* Scenario 4: Fixed Daily */}
            <h4 className="font-semibold text-on-surface pt-2">
              Scenario 4: 100 Pesos Fixed — Daily
            </h4>
            <p className="text-sm">
              Penalty per schedule = 100 x days late
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface-low text-on-surface">
                    <th className="text-left px-4 py-3 font-semibold">Due Date</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">Days Late</th>
                    <th className="text-left px-4 py-3 font-semibold">Calculation</th>
                    <th className="text-right px-4 py-3 font-semibold">Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">Feb 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">82 days</td>
                    <td className="px-4 py-3">100 x 82</td>
                    <td className="px-4 py-3 text-right font-medium">8,200</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Mar 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">54 days</td>
                    <td className="px-4 py-3">100 x 54</td>
                    <td className="px-4 py-3 text-right font-medium">5,400</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Apr 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">23 days</td>
                    <td className="px-4 py-3">100 x 23</td>
                    <td className="px-4 py-3 text-right font-medium">2,300</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-surface-low font-semibold text-on-surface">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">3,000</td>
                    <td className="px-4 py-3" colSpan={2}></td>
                    <td className="px-4 py-3 text-right">15,900</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-sm">
              Total to pay: <strong>18,900 pesos</strong>. A fixed daily penalty
              can exceed the original payment amount very quickly.
            </p>

            {/* Scenario 5: Fixed Monthly */}
            <h4 className="font-semibold text-on-surface pt-2">
              Scenario 5: 100 Pesos Fixed — Monthly
            </h4>
            <p className="text-sm">
              Penalty per schedule = 100 x months (partial months round up)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface-low text-on-surface">
                    <th className="text-left px-4 py-3 font-semibold">Due Date</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">Days Late</th>
                    <th className="text-left px-4 py-3 font-semibold">Months</th>
                    <th className="text-left px-4 py-3 font-semibold">Calculation</th>
                    <th className="text-right px-4 py-3 font-semibold">Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">Feb 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">82 days</td>
                    <td className="px-4 py-3">3</td>
                    <td className="px-4 py-3">100 x 3</td>
                    <td className="px-4 py-3 text-right font-medium">300</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Mar 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">54 days</td>
                    <td className="px-4 py-3">2</td>
                    <td className="px-4 py-3">100 x 2</td>
                    <td className="px-4 py-3 text-right font-medium">200</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Apr 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">23 days</td>
                    <td className="px-4 py-3">1</td>
                    <td className="px-4 py-3">100 x 1</td>
                    <td className="px-4 py-3 text-right font-medium">100</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-surface-low font-semibold text-on-surface">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">3,000</td>
                    <td className="px-4 py-3" colSpan={3}></td>
                    <td className="px-4 py-3 text-right">600</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-sm">
              Total to pay: <strong>3,600 pesos</strong>. More predictable than
              daily — penalties grow in monthly steps.
            </p>

            {/* Scenario 6: Fixed One-time */}
            <h4 className="font-semibold text-on-surface pt-2">
              Scenario 6: 100 Pesos Fixed — One-time
            </h4>
            <p className="text-sm">
              Penalty per schedule = 100 (flat fee, charged once)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface-low text-on-surface">
                    <th className="text-left px-4 py-3 font-semibold">Due Date</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">Days Late</th>
                    <th className="text-left px-4 py-3 font-semibold">Calculation</th>
                    <th className="text-right px-4 py-3 font-semibold">Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">Feb 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">82 days</td>
                    <td className="px-4 py-3">100 (flat)</td>
                    <td className="px-4 py-3 text-right font-medium">100</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Mar 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">54 days</td>
                    <td className="px-4 py-3">100 (flat)</td>
                    <td className="px-4 py-3 text-right font-medium">100</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Apr 1</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3">23 days</td>
                    <td className="px-4 py-3">100 (flat)</td>
                    <td className="px-4 py-3 text-right font-medium">100</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-surface-low font-semibold text-on-surface">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">3,000</td>
                    <td className="px-4 py-3" colSpan={2}></td>
                    <td className="px-4 py-3 text-right">300</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-sm">
              Total to pay: <strong>3,300 pesos</strong>. The gentlest option
              — each overdue schedule gets the same flat 100-peso fee no matter
              how late.
            </p>
          </FAQItem>

          <FAQItem question="Do penalties reduce the loan balance?">
            <p>
              No. Penalties are collected<strong> on top of </strong>the
              scheduled payment — they don&apos;t count toward paying down the
              loan. For example, if a borrower owes 1,000 pesos plus a 50-peso
              penalty, the 1,000 goes toward the loan balance and the 50 is
              recorded separately as penalty collected.
            </p>
          </FAQItem>

          <FAQItem question="What happens with partial payments?">
            <p>
              When a borrower makes a partial payment on an overdue schedule, the
              penalty portion is covered first before reducing the loan balance.
              The system tracks exactly how much of each payment went to
              penalties versus principal.
            </p>
          </FAQItem>

          <FAQItem question="Can I change or remove penalty rules?">
            <p>
              Yes. You can update penalty rules at any time by editing the loan.
              Changes recalculate penalties for all unpaid schedules going
              forward. Payments that have already been collected are not
              affected. Removing all penalty settings clears any outstanding
              penalties on unpaid schedules.
            </p>
          </FAQItem>

          <FAQItem question="Is MahFrend free to use?">
            <p>
              Yes, MahFrend is completely free. Sign up with your email or Google
              account to get started.
            </p>
          </FAQItem>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden bg-linear-to-br from-[#2a2e3a] via-[#252936] to-[#1e2a28]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-5xl mx-auto px-6 py-14">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10">
            <div>
              <span className="text-headline-md text-white">MahFrend</span>
              <p className="mt-2 text-body-md text-white/50 max-w-xs">
                Lending management for friends and family — built with heart.
              </p>
            </div>
            <div className="flex gap-16">
              <div>
                <p className="text-label-md text-white/70 mb-3">Product</p>
                <ul className="space-y-2 text-body-md text-white/50">
                  <li><a href="#features" className="hover:text-white/80 transition-colors">Features</a></li>
                  <li><a href="#faq" className="hover:text-white/80 transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <p className="text-label-md text-white/70 mb-3">Account</p>
                <ul className="space-y-2 text-body-md text-white/50">
                  <li><Link href="/signup" className="hover:text-white/80 transition-colors">Sign up</Link></li>
                  <li><Link href="/login" className="hover:text-white/80 transition-colors">Log in</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-label-md text-white/70 mb-3">Legal</p>
                <ul className="space-y-2 text-body-md text-white/50">
                  <li><Link href="/privacy-policy" className="hover:text-white/80 transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms-of-service" className="hover:text-white/80 transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/10 text-center text-label-sm text-white/30">
            MahFrend — built with love for people who lend with heart.
          </div>
        </div>
      </footer>
    </div>
  );
}
