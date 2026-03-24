'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Check, X, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { format, isBefore } from 'date-fns';
import { formatCurrency, toDate } from '@/lib/utils';
import type { LoanEntry, PaymentSchedule } from '@/types/database';

interface PaymentRow {
  id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
}

interface ScheduleEdit {
  id: string;
  due_date: string;
  amount: string; // raw string for CurrencyInput
}

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [loan, setLoan] = useState<LoanEntry | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Schedule editing state
  const [editingSchedules, setEditingSchedules] = useState(false);
  const [scheduleEdits, setScheduleEdits] = useState<ScheduleEdit[]>([]);
  const [schedulesToDelete, setSchedulesToDelete] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
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
  const pendingSchedules = schedules.filter((s) => s.status === 'pending');
  const graceDays = Number(loan.grace_period_days) || 0;
  const penaltyRate = Number(loan.penalty_rate) || 0;

  const getPenalty = (schedule: PaymentSchedule) => Number(schedule.penalty_amount) || 0;

  // Start editing: initialize edits from current pending schedules
  const startEditing = () => {
    setScheduleEdits(
      pendingSchedules.map(s => ({
        id: s.id,
        due_date: s.due_date,
        amount: String(s.amount),
      }))
    );
    setSchedulesToDelete(new Set());
    setEditingSchedules(true);
  };

  const cancelEditing = () => {
    setEditingSchedules(false);
    setScheduleEdits([]);
    setSchedulesToDelete(new Set());
  };

  const updateEdit = (index: number, field: 'due_date' | 'amount', value: string) => {
    setScheduleEdits(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeScheduleEdit = (index: number) => {
    const edit = scheduleEdits[index];
    setSchedulesToDelete(prev => new Set(prev).add(edit.id));
    setScheduleEdits(prev => prev.filter((_, i) => i !== index));
  };

  // Redistribute remaining balance evenly across pending schedules
  const redistributeEvenly = () => {
    if (scheduleEdits.length === 0) return;
    const perSchedule = remaining / scheduleEdits.length;
    const rounded = Math.round(perSchedule * 100) / 100;
    setScheduleEdits(prev =>
      prev.map((edit, i) => ({
        ...edit,
        amount: i === prev.length - 1
          ? String(Math.round((remaining - rounded * (prev.length - 1)) * 100) / 100)
          : String(rounded),
      }))
    );
  };

  const editTotal = scheduleEdits.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const editDiff = Math.abs(editTotal - remaining);
  const isEditValid = scheduleEdits.length > 0 && editDiff < 0.02 && scheduleEdits.every(e => parseFloat(e.amount) > 0 && e.due_date);

  const saveSchedules = async () => {
    setSaving(true);

    // Delete removed schedules
    if (schedulesToDelete.size > 0) {
      await supabase
        .from('payment_schedules')
        .delete()
        .in('id', Array.from(schedulesToDelete));
    }

    // Update remaining schedules
    for (const edit of scheduleEdits) {
      await supabase
        .from('payment_schedules')
        .update({
          due_date: edit.due_date,
          amount: Math.round(parseFloat(edit.amount) * 100) / 100,
        })
        .eq('id', edit.id);
    }

    // Update loan duration_months = total schedules (paid + remaining pending)
    const newDuration = paidSchedules + scheduleEdits.length;
    await supabase
      .from('loan_entries')
      .update({ duration_months: newDuration })
      .eq('id', id);

    setEditingSchedules(false);
    setScheduleEdits([]);
    setSchedulesToDelete(new Set());
    setSaving(false);
    await fetchData();
  };

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
          <div className="flex items-center gap-2">
            <span className="text-label-sm text-muted-foreground">
              {paidSchedules}/{schedules.length} paid
            </span>
            {!editingSchedules && pendingSchedules.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startEditing}
                className="text-xs text-muted-foreground hover:text-on-surface h-7 px-2"
              >
                <Pencil size={12} className="mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Edit mode controls */}
        {editingSchedules && (
          <div className="bg-surface-low rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-sm text-on-surface">
                  {scheduleEdits.length} pending schedule{scheduleEdits.length !== 1 ? 's' : ''}
                  {schedulesToDelete.size > 0 && (
                    <span className="text-status-overdue"> · {schedulesToDelete.size} to remove</span>
                  )}
                </p>
                <p className={`text-xs ${editDiff < 0.02 ? 'text-status-ontime' : 'text-status-overdue'}`}>
                  Total: {formatCurrency(editTotal)} / {formatCurrency(remaining)} remaining
                  {editDiff >= 0.02 && ` (off by ${formatCurrency(editDiff)})`}
                </p>
                {(schedulesToDelete.size > 0 || scheduleEdits.length !== pendingSchedules.length) && (
                  <p className="text-xs text-muted-foreground">
                    Duration: {paidSchedules + scheduleEdits.length} months (was {loan.duration_months ?? schedules.length})
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={redistributeEvenly}
                className="text-xs h-7 px-2"
              >
                <RotateCcw size={12} className="mr-1" />
                Split evenly
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 btn-primary-gradient text-on-primary text-xs"
                onClick={saveSchedules}
                disabled={!isEditValid || saving}
              >
                <Check size={12} className="mr-1" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={cancelEditing}
                disabled={saving}
              >
                <X size={12} className="mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {schedules.length === 0 ? (
          <div className="text-center py-8 bg-surface-lowest rounded-md">
            <p className="text-muted-foreground text-sm">No payment schedule found.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {schedules.map((schedule, i) => {
              const penalty = getPenalty(schedule);
              const isOverdue = schedule.status === 'pending' && isBefore(toDate(schedule.due_date), new Date());
              const isPending = schedule.status === 'pending';
              const editIndex = isPending && editingSchedules
                ? scheduleEdits.findIndex(e => e.id === schedule.id)
                : -1;
              const isEditing = editIndex >= 0;

              if (isEditing) {
                const edit = scheduleEdits[editIndex];
                return (
                  <div
                    key={schedule.id}
                    className="bg-surface-lowest rounded-md px-4 py-3 flex items-center gap-2 ring-1 ring-primary/20"
                  >
                    <span className="text-xs text-muted-foreground w-6">#{i + 1}</span>
                    <Input
                      type="date"
                      value={edit.due_date}
                      onChange={(e) => updateEdit(editIndex, 'due_date', e.target.value)}
                      className="h-8 bg-surface-high border-0 text-sm text-on-surface w-auto flex-1"
                    />
                    <CurrencyInput
                      value={edit.amount}
                      onValueChange={(v) => updateEdit(editIndex, 'amount', v)}
                      className="h-8 bg-surface-high border-0 text-sm text-on-surface w-28"
                      placeholder="0.00"
                    />
                    <button
                      type="button"
                      onClick={() => removeScheduleEdit(editIndex)}
                      className="text-muted-foreground hover:text-status-overdue transition-colors p-1 shrink-0"
                      title="Remove this schedule"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              }

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
