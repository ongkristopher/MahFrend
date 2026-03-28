import Link from 'next/link';
import { ArrowRight, HandCoins, CalendarCheck, ShieldCheck, ChevronDown } from 'lucide-react';

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
              className="inline-flex items-center h-10 px-5 rounded-lg btn-primary-gradient text-on-primary text-body-md font-medium"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-display-lg text-on-surface max-w-2xl mx-auto leading-tight">
          Lending made simple for friends and family
        </h1>
        <p className="mt-5 text-body-lg text-muted-foreground max-w-lg mx-auto">
          Track loans, schedule payments, and manage penalties — all in one
          place. No spreadsheets, no awkward conversations.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-lg btn-primary-gradient text-on-primary font-medium"
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#faq"
            className="inline-flex items-center h-12 px-7 rounded-lg bg-surface-lowest border border-border text-on-surface font-medium hover:bg-surface-low transition-colors"
          >
            Learn more
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-surface-lowest rounded-xl p-7 border border-border">
            <div className="w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center mb-4">
              <HandCoins className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-headline-sm text-on-surface">Loan Tracking</h3>
            <p className="mt-2 text-body-md text-muted-foreground">
              Create loans with flexible terms — set the amount, interest,
              duration, and payment frequency.
            </p>
          </div>
          <div className="bg-surface-lowest rounded-xl p-7 border border-border">
            <div className="w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center mb-4">
              <CalendarCheck className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-headline-sm text-on-surface">
              Payment Schedules
            </h3>
            <p className="mt-2 text-body-md text-muted-foreground">
              Automatic payment schedules with calendar views so you always know
              what&apos;s coming up.
            </p>
          </div>
          <div className="bg-surface-lowest rounded-xl p-7 border border-border">
            <div className="w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-headline-sm text-on-surface">
              Penalty Management
            </h3>
            <p className="mt-2 text-body-md text-muted-foreground">
              Configurable late-payment penalties with grace periods to keep
              things fair and transparent.
            </p>
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
              No. Penalties are collected <strong>on top of</strong> the
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
      <footer className="border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-body-md text-muted-foreground">
            MahFrend
          </span>
          <div className="flex gap-6 text-label-sm text-muted-foreground">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
