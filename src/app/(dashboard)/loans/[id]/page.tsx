'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, isBefore } from 'date-fns';
import { formatCurrency, toDate } from '@/lib/utils';
import type { LoanEntry, PaymentSchedule } from '@/types/database';

interface PaymentRow {
  id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
}

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [loan, setLoan] = useState<LoanEntry | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [loanRes, paymentsRes, schedulesRes] = await Promise.all([
        supabase
          .from('loan_entries')
          .select('*, borrower:borrowers(full_name)')
          .eq('id', id)
          .eq('lender_id', user.id)
          .single(),
        supabase
          .from('payments')
          .select('id, amount, payment_date, notes')
          .eq('loan_id', id)
          .eq('lender_id', user.id)
          .order('payment_date', { ascending: false }),
        supabase
          .from('payment_schedules')
          .select('*')
          .eq('loan_id', id)
          .eq('lender_id', user.id)
          .order('due_date', { ascending: true }),
      ]);

      if (loanRes.data) setLoan(loanRes.data);
      if (paymentsRes.data) setPayments(paymentsRes.data);
      if (schedulesRes.data) setSchedules(schedulesRes.data);
      setLoading(false);
    };

    fetchData();
  }, [id, supabase]);

  const statusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'text-status-ontime bg-status-ontime/10';
      case 'overdue': return 'text-status-overdue bg-status-overdue/10';
      case 'paid': return 'text-muted-foreground bg-muted-foreground/10';
      case 'defaulted': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface-lowest rounded-md p-6 animate-pulse h-40" />
        <div className="bg-surface-lowest rounded-md p-6 animate-pulse h-48" />
        <div className="bg-surface-lowest rounded-md p-6 animate-pulse h-48" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loan not found.</p>
      </div>
    );
  }

  const borrowerName = (loan.borrower as unknown as { full_name: string })?.full_name ?? 'Unknown';
  const principal = Number(loan.principal_amount);
  const total = Number(loan.total_amount);
  const paid = Number(loan.amount_paid);
  const remaining = total - paid;
  const interest = total - principal;
  const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const paidSchedules = schedules.filter((s) => s.status === 'paid').length;
  const graceDays = Number(loan.grace_period_days) || 0;
  const penaltyRate = Number(loan.penalty_rate) || 0;

  // Read penalty_amount from DB (computed by backend pg_cron function)
  const getPenalty = (schedule: PaymentSchedule) => Number(schedule.penalty_amount) || 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push('/loans')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Loans
      </button>

      {/* Loan Details */}
      <div className="bg-surface-lowest rounded-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-md text-on-surface">{borrowerName}</h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusStyle(loan.status)}`}>
              {loan.status}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/loans/${id}/edit`)}
            className="text-muted-foreground hover:text-on-surface"
          >
            <Pencil size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-label-sm text-muted-foreground">Principal</p>
            <p className="text-headline-sm text-on-surface">{formatCurrency(principal)}</p>
          </div>
          <div>
            <p className="text-label-sm text-muted-foreground">Interest ({Number(loan.interest_rate)}%)</p>
            <p className="text-headline-sm text-on-surface">{formatCurrency(interest)}</p>
          </div>
          <div>
            <p className="text-label-sm text-muted-foreground">Total Amount</p>
            <p className="text-headline-sm text-on-surface">{formatCurrency(total)}</p>
          </div>
          <div>
            <p className="text-label-sm text-muted-foreground">Remaining</p>
            <p className="text-headline-sm text-on-surface">{formatCurrency(remaining)}</p>
          </div>
          <div>
            <p className="text-label-sm text-muted-foreground">Due Date</p>
            <p className="text-headline-sm text-on-surface">{format(toDate(loan.due_date), 'MMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-label-sm text-muted-foreground">Loan Duration</p>
            <p className="text-headline-sm text-on-surface">{loan.duration_months ?? '—'} months</p>
          </div>
        </div>

        {loan.notes && (
          <div className="pt-2 border-t border-surface-low">
            <p className="text-label-sm text-muted-foreground">Notes</p>
            <p className="text-body-md text-on-surface mt-1">{loan.notes}</p>
          </div>
        )}

        {graceDays > 0 && (
          <div className="pt-2 border-t border-surface-low">
            <p className="text-label-sm text-muted-foreground">Late Payment Rules</p>
            <p className="text-body-md text-on-surface mt-1">
              {graceDays}-day grace period
              {penaltyRate > 0 && (
                <> · {loan.penalty_type === 'percentage' ? `${penaltyRate}%` : formatCurrency(penaltyRate)} penalty ({loan.penalty_frequency === 'daily' ? 'per day' : loan.penalty_frequency === 'monthly' ? 'per month' : 'one-time'})</>
              )}
            </p>
          </div>
        )}

        {/* Progress bar */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(paid)} paid</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-surface-low rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-headline-sm text-on-surface">Payment Schedule</h2>
          <span className="text-label-sm text-muted-foreground">
            {paidSchedules}/{schedules.length} months paid
          </span>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-8 bg-surface-lowest rounded-md">
            <p className="text-muted-foreground text-sm">No payment schedule found.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {schedules.map((schedule, i) => {
              const penalty = getPenalty(schedule);
              const isOverdue = schedule.status === 'pending' && isBefore(toDate(schedule.due_date), new Date());
              return (
                <div
                  key={schedule.id}
                  className="bg-surface-lowest rounded-md px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-6">#{i + 1}</span>
                    <div>
                      <span className="text-sm text-on-surface">
                        {format(toDate(schedule.due_date), 'MMM d, yyyy')}
                      </span>
                      {penalty > 0 && (
                        <p className="text-[10px] text-status-overdue">
                          +{formatCurrency(penalty)} penalty
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-medium text-on-surface">
                        {formatCurrency(schedule.amount)}
                      </span>
                      {penalty > 0 && (
                        <p className="text-[10px] font-medium text-status-overdue">
                          {formatCurrency(Number(schedule.amount) + penalty)}
                        </p>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      schedule.status === 'paid'
                        ? 'text-muted-foreground bg-muted-foreground/10'
                        : isOverdue
                          ? 'text-status-overdue bg-status-overdue/10'
                          : 'text-status-ontime bg-status-ontime/10'
                    }`}>
                      {schedule.status === 'paid' ? 'paid' : isOverdue ? 'overdue' : 'pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="space-y-3">
        <h2 className="text-headline-sm text-on-surface">Payment History</h2>

        {payments.length === 0 ? (
          <div className="text-center py-8 bg-surface-lowest rounded-md">
            <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_90px_1fr] gap-2 px-4 py-2">
              <span className="text-label-sm text-muted-foreground">Amount</span>
              <span className="text-label-sm text-muted-foreground text-right">Date</span>
              <span className="text-label-sm text-muted-foreground text-right">Notes</span>
            </div>
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-surface-lowest rounded-md p-4 grid grid-cols-[1fr_90px_1fr] gap-2 items-center"
              >
                <p className="text-sm text-green-500 font-medium">
                  {formatCurrency(payment.amount, { sign: true })}
                </p>
                <p className="text-xs text-muted-foreground text-right">
                  {format(toDate(payment.payment_date), 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground text-right truncate">
                  {payment.notes || '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
