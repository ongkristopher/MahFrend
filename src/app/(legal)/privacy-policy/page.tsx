import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — MahFrend',
  description: 'How MahFrend collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose-legal space-y-8">
      <div>
        <h1 className="text-display-md text-on-surface">Privacy Policy</h1>
        <p className="mt-2 text-body-md text-muted-foreground">
          Last updated: March 29, 2026
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">1. Introduction</h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          MahFrend (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
          is a personal lending management app that helps you track loans,
          payments, and borrowers among friends and family. This Privacy Policy
          explains what information we collect, how we use it, and how we keep
          it safe.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          2. Information We Collect
        </h2>
        <h3 className="text-headline-sm text-on-surface">
          Account Information
        </h3>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          When you sign up, we collect your email address, display name, and
          authentication credentials. If you sign in with Google, we receive
          your name and email from your Google account.
        </p>
        <h3 className="text-headline-sm text-on-surface">Lending Data</h3>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          You provide information about your loans, borrowers, payment
          schedules, and payment records. This includes borrower names, contact
          details (email, phone), loan amounts, interest rates, payment dates,
          and notes you choose to add.
        </p>
        <h3 className="text-headline-sm text-on-surface">Usage Data</h3>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          We collect basic analytics through Vercel Analytics and Speed Insights
          to understand how the app is used and improve performance. This
          includes page views, device type, and general usage patterns — no
          personal financial data is included.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          3. How We Use Your Information
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          We use your information to:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-body-lg text-muted-foreground">
          <li>Provide and maintain the MahFrend service</li>
          <li>Display your loans, payment schedules, borrower profiles, and dashboard</li>
          <li>Calculate penalties and track payment balances</li>
          <li>Authenticate your identity when you log in</li>
          <li>Improve the app based on aggregated, anonymized usage data</li>
        </ul>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          We do <strong>not</strong> sell, rent, or share your personal or
          financial data with third parties for marketing purposes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          4. Data Storage and Security
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          Your data is stored securely in Supabase, a hosted database platform
          with encryption at rest and in transit. Authentication is handled
          through Supabase Auth, which uses industry-standard security practices
          including secure session tokens and OAuth 2.0 for Google sign-in.
        </p>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          While we take reasonable measures to protect your data, no system is
          100% secure. We encourage you to use a strong, unique password for
          your account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          5. Your Data, Your Control
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          All the lending data you enter — loans, borrowers, payments — belongs
          to you. You can:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-body-lg text-muted-foreground">
          <li>View, edit, or delete your loans and payment records at any time</li>
          <li>Update or remove borrower information</li>
          <li>Request a full deletion of your account and all associated data by contacting us</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          6. Third-Party Services
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          MahFrend uses the following third-party services:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-body-lg text-muted-foreground">
          <li>
            <strong>Supabase</strong> — database hosting and authentication
          </li>
          <li>
            <strong>Vercel</strong> — app hosting, analytics, and performance
            monitoring
          </li>
          <li>
            <strong>Google OAuth</strong> — optional sign-in method
          </li>
        </ul>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          Each of these services has its own privacy policy. We only share the
          minimum data required for these services to function.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          7. Cookies and Local Storage
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          We use cookies solely for authentication — to keep you logged in
          across sessions. We do not use cookies for advertising or tracking
          across other websites.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          8. Children&apos;s Privacy
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          MahFrend is not intended for use by anyone under the age of 18. We do
          not knowingly collect information from children.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">
          9. Changes to This Policy
        </h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time. If we make
          significant changes, we&apos;ll update the &ldquo;Last updated&rdquo;
          date at the top of this page. Your continued use of MahFrend after
          changes are posted constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-headline-md text-on-surface">10. Contact Us</h2>
        <p className="text-body-lg text-muted-foreground leading-relaxed">
          If you have questions about this Privacy Policy or want to request
          deletion of your data, please reach out to us through the app or
          contact us directly.
        </p>
      </section>
    </article>
  );
}
