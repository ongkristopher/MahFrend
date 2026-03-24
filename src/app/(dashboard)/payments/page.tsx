'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface PaymentRow {
  id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
  loan: { total_amount: number; borrower: { full_name: string } };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchPayments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('payments')
        .select('id, amount, payment_date, notes, created_at, loan:loan_entries(total_amount, borrower:borrowers(full_name))')
        .eq('lender_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setPayments(data as unknown as PaymentRow[]);
      setLoading(false);
    };

    fetchPayments();
  }, [supabase]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-label-md text-muted-foreground">Transaction Management</p>
          <h1 className="text-display-md text-on-surface">Payments</h1>
        </div>
        <Button
          className="h-9 btn-primary-gradient text-on-primary text-sm font-medium"
          onClick={() => router.push('/payments/new')}
        >
          <Plus size={14} className="mr-2" />
          Add Payment
        </Button>
      </div>

      {/* Table */}
      <div className="space-y-1">
        <div className="grid grid-cols-[1fr_90px_90px_1fr] gap-2 px-4 py-2">
          <span className="text-label-sm text-muted-foreground">Borrower</span>
          <span className="text-label-sm text-muted-foreground text-right">Amount</span>
          <span className="text-label-sm text-muted-foreground text-right">Date</span>
          <span className="text-label-sm text-muted-foreground text-right">Notes</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-lowest rounded-md p-4 animate-pulse h-14" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-body-md">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {payments.map((payment) => {
              const borrowerName = payment.loan?.borrower?.full_name ?? 'Unknown';
              return (
                <div
                  key={payment.id}
                  className="bg-surface-lowest rounded-md p-4 grid grid-cols-[1fr_90px_90px_1fr] gap-2 items-center"
                >
                  <p className="text-sm font-medium text-on-surface truncate">{borrowerName}</p>
                  <p className="text-sm text-green-500 font-medium text-right">
                    {formatCurrency(payment.amount, { sign: true })}
                  </p>
                  <p className="text-xs text-muted-foreground text-right">
                    {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground text-right truncate">
                    {payment.notes || '—'}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {payments.length > 0 && (
          <p className="text-label-sm text-muted-foreground px-4 pt-2">
            {payments.length} payment{payments.length === 1 ? '' : 's'}
          </p>
        )}
      </div>
    </div>
  );
}
