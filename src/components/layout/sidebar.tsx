'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings2,
  FileText,
  CreditCard,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/loans', label: 'Loan Entry', icon: FileText },
  { href: '/payments', label: 'Payment', icon: CreditCard },
  { href: '/configuration', label: 'Configuration', icon: Settings2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-surface-low min-h-[calc(100vh-3.5rem)] py-6 px-3">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-surface-lowest text-on-surface'
                  : 'text-muted-foreground hover:text-on-surface hover:bg-surface-lowest/50'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
