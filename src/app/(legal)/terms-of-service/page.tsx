import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — MahFrend',
  description: 'Terms and conditions for using MahFrend.',
};

export default function TermsOfServicePage() {
  return (
    <article className="prose-legal space-y-8">
      <div>
        <h1 className="text-display-md text-on-surface">Terms of Service</h1>
        <p className="mt-2 text-body-md text-muted-foreground">
          Last updated: March 29, 2026
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          1. What MahFrend Is
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          MahFrend is a free, personal lending management tool designed to help
          you track loans, payments, and borrowers among friends and family. It
          is a record-keeping tool — not a financial institution, lender, or
          debt collection service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          2. Acceptance of Terms
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          By creating an account or using MahFrend, you agree to these Terms of
          Service. If you don&apos;t agree, please don&apos;t use the app.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          3. Your Account
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          You are responsible for keeping your login credentials secure. You are
          also responsible for all activity that happens under your account. If
          you believe your account has been compromised, please change your
          password immediately.
        </p>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          You must be at least 18 years old to use MahFrend.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          4. How You Can Use MahFrend
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          MahFrend is meant for personal, non-commercial use — specifically to
          help you organize informal loans between people you know. You agree
          to use it in good faith and not to:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-body-lg text-muted-foreground">
          <li>Use the app for any illegal activity, including unlicensed money lending where prohibited by law</li>
          <li>Enter false or misleading information</li>
          <li>Attempt to access another user&apos;s account or data</li>
          <li>Interfere with or disrupt the service</li>
          <li>Use automated tools to scrape or extract data from the app</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          5. Your Data and Content
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          All the data you enter — loans, borrower details, payments, notes —
          belongs to you. We don&apos;t claim ownership over your content. We
          only use it to provide the service to you, as described in our{' '}
          <a href="/privacy-policy" className="text-on-surface font-medium underline underline-offset-2">
            Privacy Policy
          </a>.
        </p>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          You are solely responsible for the accuracy of the information you
          enter. MahFrend is a tracking tool and does not verify the validity
          of any loan, payment, or borrower information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          6. Penalty Calculations
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          MahFrend provides automated penalty calculations based on the rules
          you configure (grace period, penalty type, rate, and frequency). These
          calculations are provided as a convenience and are based entirely on
          your inputs.
        </p>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          MahFrend does <strong>not</strong> provide legal or financial advice.
          The penalty rules you set are your own — please make sure they comply
          with any applicable local laws or regulations regarding lending and
          interest rates in your area.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          7. No Guarantees
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          MahFrend is provided &ldquo;as is&rdquo; and &ldquo;as
          available.&rdquo; We do our best to keep the app running smoothly,
          but we can&apos;t guarantee:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-body-lg text-muted-foreground">
          <li>The service will be available 100% of the time without interruption</li>
          <li>The app will be free of bugs or errors</li>
          <li>That any borrower will actually pay you back (we really wish we could, though)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          8. Limitation of Liability
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          MahFrend is a free tool for personal record-keeping. To the fullest
          extent permitted by law, we are not liable for any losses, damages,
          or disputes that arise from:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-body-lg text-muted-foreground">
          <li>Inaccurate data you entered into the system</li>
          <li>Disputes between you and your borrowers</li>
          <li>Financial losses related to loans tracked in the app</li>
          <li>Service interruptions or data loss</li>
        </ul>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          You use MahFrend at your own risk. We are a tracking tool, not a
          party to any lending agreement between you and your borrowers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          9. Termination
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          You can stop using MahFrend at any time. We may also suspend or
          terminate your access if you violate these terms or use the app in a
          way that could harm other users or the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          10. Changes to These Terms
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          We may update these Terms of Service from time to time. If we make
          significant changes, we&apos;ll update the &ldquo;Last updated&rdquo;
          date at the top. Continued use of MahFrend after changes means you
          accept the new terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">11. Contact Us</h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          If you have questions about these Terms of Service, feel free to reach
          out through the app or contact us directly.
        </p>
      </section>
    </article>
  );
}
