'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { LoanEntry } from '@/types/database';

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchLoans = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('loan_entries')
        .select('*, borrower:borrowers(full_name)')
        .eq('lender_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setLoans(data);
      setLoading(false);
    };

    fetchLoans();
  }, [supabase]);

  const statusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'text-status-ontime bg-status-ontime/10';
      case 'overdue': return 'text-status-overdue bg-status-overdue/10';
      case 'paid': return 'text-muted-foreground bg-muted-foreground/10';
      case 'defaulted': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-label-md text-muted-foreground">Financial Operations</p>
          <h1 className="text-display-md text-on-surface">Loan Entries</h1>
        </div>
        <Button
          className="h-9 btn-primary-gradient text-on-primary text-sm font-medium"
          onClick={() => router.push('/loans/new')}
        >
          <Plus size={14} className="mr-2" />
          New Loan Entry
        </Button>
      </div>

      {/* Table */}
      <div className="space-y-1">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_80px_80px_80px_70px] gap-2 px-4 py-2">
          <span className="text-label-sm text-muted-foreground">Borrower</span>
          <span className="text-label-sm text-muted-foreground text-right">Principal</span>
          <span className="text-label-sm text-muted-foreground text-right">Total</span>
          <span className="text-label-sm text-muted-foreground text-right">Due Date</span>
          <span className="text-label-sm text-muted-foreground text-right">Status</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-lowest rounded-md p-4 animate-pulse h-14" />
            ))}
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-body-md">
              No loan entries yet. Create your first loan to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {loans.map((loan) => {
              const borrowerName = (loan.borrower as unknown as { full_name: string })?.full_name ?? 'Unknown';
              const paid = Number(loan.amount_paid);
              const total = Number(loan.total_amount);
              const principal = Number(loan.principal_amount);
              const interest = total - principal;
              const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;

              return (
                <button
                  key={loan.id}
                  onClick={() => router.push(`/loans/${loan.id}`)}
                  className="w-full bg-surface-lowest rounded-md p-4 grid grid-cols-[1fr_80px_80px_80px_70px] gap-2 items-center text-left hover:bg-surface-low/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{borrowerName}</p>
                    <div className="mt-1 h-1 w-full bg-surface-low rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      ₱{paid.toLocaleString()} / ₱{total.toLocaleString()} paid
                      {interest > 0 && <span className="text-muted-foreground/60"> (₱{interest.toLocaleString()} interest)</span>}
                    </p>
                  </div>
                  <p className="text-sm text-on-surface text-right">
                    ₱{principal.toLocaleString()}
                  </p>
                  <p className="text-sm text-on-surface text-right">
                    ₱{total.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground text-right">
                    {format(new Date(loan.due_date), 'MMM d, yyyy')}
                  </p>
                  <div className="flex justify-end">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${statusStyle(loan.status)}`}>
                      {loan.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {loans.length > 0 && (
          <p className="text-label-sm text-muted-foreground px-4 pt-2">
            {loans.length} loan {loans.length === 1 ? 'entry' : 'entries'}
          </p>
        )}
      </div>
    </div>
  );
}
