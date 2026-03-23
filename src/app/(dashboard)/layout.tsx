import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pb-20 lg:pb-6 px-4 lg:px-8 py-6 max-w-5xl">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
