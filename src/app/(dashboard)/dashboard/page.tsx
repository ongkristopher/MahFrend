'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, DollarSign, Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types/database';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    active_borrowers: 0,
    total_lent: 0,
    available_to_lend: 0,
    profit_or_loss: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all data in parallel
      const [borrowersRes, loansRes, configRes, paymentsRes] = await Promise.all([
        supabase
          .from('borrowers')
          .select('id', { count: 'exact' })
          .eq('lender_id', user.id)
          .eq('status', 'active'),
        supabase
          .from('loan_entries')
          .select('principal_amount, total_amount, amount_paid, status')
          .eq('lender_id', user.id),
        supabase
          .from('lending_configurations')
          .select('total_loanable_amount')
          .eq('lender_id', user.id)
          .single(),
        supabase
          .from('payments')
          .select('amount')
          .eq('lender_id', user.id),
      ]);

      const activeBorrowers = borrowersRes.count || 0;
      const loans = loansRes.data || [];
      const config = configRes.data;
      const payments = paymentsRes.data || [];

      const totalLent = loans
        .filter((l) => l.status !== 'paid')
        .reduce((sum, l) => sum + Number(l.principal_amount), 0);

      const totalLoanable = config?.total_loanable_amount || 0;
      const availableToLend = Math.max(0, Number(totalLoanable) - totalLent);

      const totalExpectedInterest = loans.reduce(
        (sum, l) => sum + (Number(l.total_amount) - Number(l.principal_amount)),
        0
      );
      const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalPrincipalLent = loans.reduce((sum, l) => sum + Number(l.principal_amount), 0);
      const profitOrLoss = totalCollected - totalPrincipalLent;

      setStats({
        active_borrowers: activeBorrowers,
        total_lent: totalLent,
        available_to_lend: availableToLend,
        profit_or_loss: profitOrLoss,
      });
      setLoading(false);
    };

    fetchStats();
  }, [supabase]);

  const profitLossColor =
    stats.profit_or_loss > 0
      ? 'text-green-500'
      : stats.profit_or_loss < 0
        ? 'text-red-500'
        : 'text-on-surface';

  const statCards = [
    {
      label: 'Active Borrowers',
      value: stats.active_borrowers.toString(),
      icon: Users,
      format: 'number' as const,
      valueClassName: 'text-on-surface',
    },
    {
      label: 'Total Amount Lent',
      value: stats.total_lent,
      icon: DollarSign,
      format: 'currency' as const,
      valueClassName: 'text-on-surface',
    },
    {
      label: 'Available to Lend',
      value: stats.available_to_lend,
      icon: Wallet,
      format: 'currency' as const,
      valueClassName: 'text-on-surface',
    },
    {
      label: 'Profit / Loss',
      value: stats.profit_or_loss,
      icon: TrendingUp,
      format: 'currency_signed' as const,
      valueClassName: profitLossColor,
    },
  ];

  const formatValue = (value: number | string, fmt: string) => {
    if (fmt === 'number') return value;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (fmt === 'currency_signed') {
      return formatCurrency(num, { sign: true });
    }
    return formatCurrency(num);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-label-md text-muted-foreground">Overview</p>
        <h1 className="text-display-md text-on-surface">Lending Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-surface-lowest rounded-md p-5 flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="text-label-md text-muted-foreground">{card.label}</p>
              <p className={`text-display-md ${card.valueClassName} ${loading ? 'animate-pulse' : ''}`}>
                {loading ? '—' : formatValue(card.value, card.format)}
              </p>
            </div>
            <div className="p-2.5 bg-surface-low rounded-md">
              <card.icon size={20} className="text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-headline-sm text-on-surface">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="h-12 btn-primary-gradient text-on-primary font-medium"
            onClick={() => router.push('/loans')}
          >
            <span className="mr-2">+</span> Create Loan
          </Button>
          <Button
            variant="secondary"
            className="h-12 bg-surface-lowest text-on-surface font-medium"
            onClick={() => router.push('/users')}
          >
            <span className="mr-2">+</span> Add User
          </Button>
        </div>
      </div>
    </div>
  );
}
