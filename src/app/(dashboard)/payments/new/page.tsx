'use client';

import { createClient } from '@/lib/supabase/client';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, isBefore } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import type { Borrower, LoanEntry, PaymentSchedule } from '@/types/database';

export default function NewPaymentPage() {
  return (
    <Suspense>
      <NewPaymentForm />
    </Suspense>
  );
}

function NewPaymentForm() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [loans, setLoans] = useState<LoanEntry[]>([]);
  const [selectedLoan, setSelectedLoan] = useState('');
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const paramBorrower = searchParams.get('borrower');
  const paramLoan = searchParams.get('loan');

  useEffect(() => {
    const fetchBorrowers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('borrowers')
        .select('*')
        .eq('lender_id', user.id)
        .eq('status', 'active')
        .order('full_name');

      if (data) {
        setBorrowers(data);
        if (paramBorrower && !prefilled && data.some(b => b.id === paramBorrower)) {
          setSelectedBorrower(paramBorrower);
        }
      }
    };

    fetchBorrowers();
  }, [supabase, paramBorrower, prefilled]);

  useEffect(() => {
    const fetchLoans = async () => {
      if (!selectedBorrower) {
        setLoans([]);
        setSelectedLoan('');
        setSchedules([]);
        setSelectedSchedules(new Set());
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('loan_entries')
        .select('*')
        .eq('lender_id', user.id)
        .eq('borrower_id', selectedBorrower)
        .in('status', ['active', 'overdue'])
        .order('created_at', { ascending: false });

      if (data) {
        setLoans(data);
        if (paramLoan && !prefilled && data.some(l => l.id === paramLoan)) {
          setSelectedLoan(paramLoan);
          setPrefilled(true);
        }
      }
    };

    fetchLoans();
  }, [selectedBorrower, supabase, paramLoan, prefilled]);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedLoan) {
        setSchedules([]);
        setSelectedSchedules(new Set());
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('loan_id', selectedLoan)
        .eq('lender_id', user.id)
        .order('due_date', { ascending: true });

      if (data) setSchedules(data);
    };

    fetchSchedules();
  }, [selectedLoan, supabase]);

  const pendingSchedules = schedules.filter(s => s.status === 'pending');
  const selectedLoanData = loans.find((l) => l.id === selectedLoan);

  // Read penalty_amount directly from DB — no frontend computation
  const getPenalty = (schedule: PaymentSchedule) => Number(schedule.penalty_amount) || 0;
  const totalPenalty = pendingSchedules.reduce((sum, s) => sum + getPenalty(s), 0);

  const toggleSchedule = useCallback((scheduleId: string) => {
    setSelectedSchedules(prev => {
      const next = new Set(prev);
      if (next.has(scheduleId)) {
        next.delete(scheduleId);
      } else {
        next.add(scheduleId);
      }
      return next;
    });
  }, []);

  // Auto-fill amount when schedules are selected (includes DB penalties)
  useEffect(() => {
    if (selectedSchedules.size > 0) {
      const total = schedules
        .filter(s => selectedSchedules.has(s.id))
        .reduce((sum, s) => sum + Number(s.amount) + getPenalty(s), 0);
      setAmount(total.toFixed(2));
    }
  }, [selectedSchedules, schedules]);

  const remaining = selectedLoanData
    ? Number(selectedLoanData.total_amount) - Number(selectedLoanData.amount_paid)
    : 0;

  const selectedBorrowerName = borrowers.find(b => b.id === selectedBorrower)?.full_name;
  const selectedLoanLabel = selectedLoanData
    ? `${formatCurrency(selectedLoanData.total_amount)} — Due ${format(new Date(selectedLoanData.due_date), 'MMM d, yyyy')}`
    : undefined;

  const handleSubmit = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payAmount = parseFloat(amount);

    const { error } = await supabase.from('payments').insert({
      loan_id: selectedLoan,
      lender_id: user.id,
      amount: payAmount,
      payment_date: paymentDate,
      notes: notes || null,
    });

    if (!error) {
      let penaltyPaid = 0;

      if (selectedSchedules.size > 0) {
        const sortedSelected = schedules
          .filter(s => selectedSchedules.has(s.id))
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

        let remainingPayment = payAmount;
        const schedulesToMarkPaid: string[] = [];

        for (const schedule of sortedSelected) {
          const penalty = getPenalty(schedule);
          const totalDue = Number(schedule.amount) + penalty;

          if (remainingPayment >= totalDue) {
            schedulesToMarkPaid.push(schedule.id);
            penaltyPaid += penalty;
            remainingPayment -= totalDue;
          } else {
            const paidTowardPenalty = Math.max(0, remainingPayment - Number(schedule.amount));
            penaltyPaid += paidTowardPenalty;
            break;
          }
        }

        if (schedulesToMarkPaid.length > 0) {
          await supabase
            .from('payment_schedules')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .in('id', schedulesToMarkPaid);
        }
      }

      // Only the non-penalty portion counts toward loan repayment
      const principalPortion = payAmount - penaltyPaid;
      const newAmountPaid = Number(selectedLoanData!.amount_paid) + principalPortion;
      const newStatus = newAmountPaid >= Number(selectedLoanData!.total_amount) ? 'paid' : selectedLoanData!.status;

      await supabase
        .from('loan_entries')
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
        })
        .eq('id', selectedLoan);

      setSuccess(true);
      setTimeout(() => router.push('/payments'), 1500);
    }
    setLoading(false);
  };

  const isValid = selectedBorrower && selectedLoan && parseFloat(amount) > 0 && paymentDate;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.push('/payments')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Payments
        </button>
        <div className="space-y-2">
          <p className="text-label-md text-muted-foreground">Transaction Management</p>
          <h1 className="text-display-md text-on-surface">Record Payment</h1>
          <p className="text-body-md text-muted-foreground">
            Securely document loan repayments. Select the account holder and specific loan instance to update the ledger.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Account Holder</Label>
          <Select value={selectedBorrower} onValueChange={(v) => setSelectedBorrower(v ?? '')}>
            <SelectTrigger className="h-12 bg-surface-lowest border-0">
              <SelectValue placeholder="Select holder...">
                {selectedBorrowerName || undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-surface-lowest">
              {borrowers.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Active Loan Entry</Label>
          <Select value={selectedLoan} onValueChange={(v) => setSelectedLoan(v ?? '')} disabled={!selectedBorrower}>
            <SelectTrigger className="h-12 bg-surface-lowest border-0">
              <SelectValue placeholder="Select active loan...">
                {selectedLoanLabel || undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-surface-lowest">
              {loans.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {formatCurrency(l.total_amount)} — Due {format(new Date(l.due_date), 'MMM d, yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Schedule Selection */}
        {selectedLoan && pendingSchedules.length > 0 && (
          <div className="space-y-2">
            <Label className="text-label-md text-muted-foreground">
              Select Months to Pay ({selectedSchedules.size} selected)
            </Label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {pendingSchedules.map((schedule) => {
                const isChecked = selectedSchedules.has(schedule.id);
                const scheduleIndex = schedules.findIndex(s => s.id === schedule.id);
                const penalty = getPenalty(schedule);
                const totalDue = Number(schedule.amount) + penalty;
                const isOverdue = isBefore(new Date(schedule.due_date), new Date());
                return (
                  <button
                    key={schedule.id}
                    type="button"
                    onClick={() => toggleSchedule(schedule.id)}
                    className={`w-full rounded-md px-4 py-3 flex items-center justify-between transition-colors ${
                      isChecked
                        ? 'bg-primary/10 ring-1 ring-primary/30'
                        : 'bg-surface-lowest hover:bg-surface-low/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-primary border-primary'
                          : 'border-surface-high'
                      }`}>
                        {isChecked && <Check size={12} className="text-on-primary" />}
                      </div>
                      <div className="text-left">
                        <span className="text-xs text-muted-foreground">#{scheduleIndex + 1}</span>
                        <span className={`text-sm ml-2 ${isOverdue ? 'text-status-overdue' : 'text-on-surface'}`}>
                          {format(new Date(schedule.due_date), 'MMM d, yyyy')}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] text-status-overdue ml-1">overdue</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-on-surface">
                        {penalty > 0 ? formatCurrency(totalDue) : formatCurrency(schedule.amount)}
                      </span>
                      {penalty > 0 && (
                        <p className="text-[10px] text-status-overdue">
                          {formatCurrency(schedule.amount)} + {formatCurrency(penalty)} penalty
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {totalPenalty > 0 && (
              <p className="text-label-sm text-status-overdue">
                Total penalties: {formatCurrency(totalPenalty)}
              </p>
            )}
            {selectedSchedules.size > 0 && (
              <p className="text-label-sm text-muted-foreground">
                Selected total: {formatCurrency(
                  schedules
                    .filter(s => selectedSchedules.has(s.id))
                    .reduce((sum, s) => sum + Number(s.amount) + getPenalty(s), 0)
                )}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Payment Amount</Label>
          <CurrencyInput
            value={amount}
            onValueChange={setAmount}
            className="h-12 bg-surface-lowest border-0 text-on-surface"
            placeholder="0.00"
          />
          {selectedLoanData && (
            <p className="text-label-sm text-muted-foreground">
              Remaining balance: {formatCurrency(remaining)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Payment Date</Label>
          <Input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="h-12 bg-surface-lowest border-0 text-on-surface"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Notes (Optional)</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-10 bg-surface-lowest border-0 text-on-surface"
            placeholder="e.g. Partial payment via bank transfer"
          />
        </div>

        <Button
          className="w-full h-12 btn-primary-gradient text-on-primary font-medium"
          onClick={handleSubmit}
          disabled={!isValid || loading}
        >
          {loading ? 'Processing...' : 'Confirm Payment'}
        </Button>

        {success && (
          <p className="text-sm text-status-ontime text-center">Payment recorded successfully! Redirecting...</p>
        )}
      </div>

      {/* Summary Preview */}
      {selectedLoanData && parseFloat(amount) > 0 && (
        <div className="bg-inverse-surface rounded-md p-6 space-y-4">
          <h3 className="text-label-md text-on-primary/60">Summary Preview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-label-sm text-on-primary/40">Payment</p>
              <p className="text-headline-sm text-on-primary">
                {formatCurrency(parseFloat(amount))}
              </p>
            </div>
            <div>
              <p className="text-label-sm text-on-primary/40">New Balance</p>
              <p className="text-headline-sm text-on-primary">
                {formatCurrency(Math.max(0, remaining - (parseFloat(amount) - schedules
                  .filter(s => selectedSchedules.has(s.id))
                  .reduce((sum, s) => sum + getPenalty(s), 0))))}
              </p>
            </div>
            <div>
              <p className="text-label-sm text-on-primary/40">Schedules Covered</p>
              <p className="text-headline-sm text-on-primary">
                {selectedSchedules.size || '—'}
              </p>
            </div>
            {totalPenalty > 0 && selectedSchedules.size > 0 && (
              <div>
                <p className="text-label-sm text-on-primary/40">Penalties Included</p>
                <p className="text-headline-sm text-status-overdue">
                  {formatCurrency(
                    schedules
                      .filter(s => selectedSchedules.has(s.id))
                      .reduce((sum, s) => sum + getPenalty(s), 0)
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
