import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <nav className="glass sticky top-0 z-50 border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-body-md text-muted-foreground hover:text-on-surface transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <Link href="/" className="text-headline-md text-on-surface">
            MahFrend
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-16">
        {children}
      </main>
      <footer className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-label-sm text-muted-foreground">
          <span>MahFrend</span>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-on-surface transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-on-surface transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
