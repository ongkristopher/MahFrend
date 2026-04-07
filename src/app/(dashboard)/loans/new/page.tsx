'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addMonths, differenceInCalendarMonths, endOfMonth, format, setDate } from 'date-fns';
import { formatCurrency, safeDate } from '@/lib/utils';
import type { Borrower } from '@/types/database';

export default function NewLoanPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [loanDate, setLoanDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(addMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'semi_monthly'>('monthly');
  const [notes, setNotes] = useState('');
  const [gracePeriodDays, setGracePeriodDays] = useState(0);
  const [penaltyType, setPenaltyType] = useState<'percentage' | 'fixed_amount' | ''>('');
  const [penaltyRate, setPenaltyRate] = useState('');
  const [penaltyFrequency, setPenaltyFrequency] = useState<'daily' | 'monthly' | 'one_time' | ''>('');
  const [customScheduleDates, setCustomScheduleDates] = useState<Record<number, string>>({});
  const [customScheduleAmounts, setCustomScheduleAmounts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [availableToLend, setAvailableToLend] = useState<number | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [borrowersRes, configRes, loansRes] = await Promise.all([
        supabase
          .from('borrowers')
          .select('*')
          .eq('lender_id', user.id)
          .eq('status', 'active')
          .order('full_name'),
        supabase
          .from('lending_configurations')
          .select('total_loanable_amount')
          .eq('lender_id', user.id)
          .single(),
        supabase
          .from('loan_entries')
          .select('principal_amount, status')
          .eq('lender_id', user.id)
          .in('status', ['active', 'overdue']),
      ]);

      if (borrowersRes.data) setBorrowers(borrowersRes.data);

      const totalLoanable = Number(configRes.data?.total_loanable_amount) || 0;
      const totalLent = (loansRes.data || []).reduce((sum, l) => sum + Number(l.principal_amount), 0);
      setAvailableToLend(Math.max(0, totalLoanable - totalLent));
    };

    fetchData();
  }, [supabase]);

  const principalNum = parseFloat(principal) || 0;
  const interestNum = parseFloat(interestRate) || 0;
  const interestAmount = principalNum * (interestNum / 100);
  const totalAmount = principalNum + interestAmount;
  const totalPayments = paymentFrequency === 'semi_monthly' ? durationMonths * 2 : durationMonths;
  const paymentAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;
  const monthlyPayment = durationMonths > 0 ? totalAmount / durationMonths : 0;

  // When slider changes → recalculate due date from loan date
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const months = parseInt(e.target.value);
    setDurationMonths(months);
    const base = safeDate(loanDate);
    if (base) setDueDate(format(addMonths(base, months), 'yyyy-MM-dd'));
  }, [loanDate]);

  // When loan date changes → recalculate due date from tenure
  const handleLoanDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLoanDate = e.target.value;
    setLoanDate(newLoanDate);
    const base = safeDate(newLoanDate);
    if (base) setDueDate(format(addMonths(base, durationMonths), 'yyyy-MM-dd'));
  };

  // When due date changes → recalculate tenure from dates
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDueDate = e.target.value;
    setDueDate(newDueDate);
    const d = safeDate(newDueDate);
    const l = safeDate(loanDate);
    if (d && l) {
      const months = Math.max(1, differenceInCalendarMonths(d, l));
      setDurationMonths(Math.min(36, months));
    }
  };

  // Generate schedule preview with customisable dates and amounts
  const loanDateParsed = safeDate(loanDate) ?? new Date();
  const schedulePreview = (() => {
    if (paymentFrequency === 'semi_monthly') {
      const entries: { index: number; date: string; amount: number }[] = [];
      const perPayment = totalAmount / (durationMonths * 2);
      for (let i = 0; i < durationMonths; i++) {
        const monthDate = addMonths(loanDateParsed, i + 1);
        const midIdx = entries.length;
        const lastIdx = midIdx + 1;
        entries.push({ index: midIdx, date: customScheduleDates[midIdx] ?? format(setDate(monthDate, 15), 'yyyy-MM-dd'), amount: customScheduleAmounts[midIdx] !== undefined ? (parseFloat(customScheduleAmounts[midIdx]) || 0) : perPayment });
        entries.push({ index: lastIdx, date: customScheduleDates[lastIdx] ?? format(endOfMonth(monthDate), 'yyyy-MM-dd'), amount: customScheduleAmounts[lastIdx] !== undefined ? (parseFloat(customScheduleAmounts[lastIdx]) || 0) : perPayment });
      }
      return entries;
    }
    return Array.from({ length: durationMonths }, (_, i) => ({
      index: i,
      date: customScheduleDates[i] ?? format(addMonths(loanDateParsed, i + 1), 'yyyy-MM-dd'),
      amount: customScheduleAmounts[i] !== undefined ? (parseFloat(customScheduleAmounts[i]) || 0) : monthlyPayment,
    }));
  })();

  const handleScheduleDateChange = (index: number, newDate: string) => {
    setCustomScheduleDates(prev => ({ ...prev, [index]: newDate }));
  };

  const handleScheduleAmountChange = (index: number, newAmount: string) => {
    setCustomScheduleAmounts(prev => ({ ...prev, [index]: newAmount }));
  };

  const splitEvenly = () => {
    if (totalPayments <= 0 || totalAmount <= 0) return;
    const perPayment = Math.round((totalAmount / totalPayments) * 100) / 100;
    const newAmounts: Record<number, string> = {};
    for (let i = 0; i < totalPayments; i++) {
      newAmounts[i] = i === totalPayments - 1
        ? String(Math.round((totalAmount - perPayment * (totalPayments - 1)) * 100) / 100)
        : String(perPayment);
    }
    setCustomScheduleAmounts(newAmounts);
  };

  const scheduleTotal = schedulePreview.reduce((sum, e) => sum + e.amount, 0);
  const scheduleDiff = Math.abs(scheduleTotal - totalAmount);
  const hasCustomAmounts = Object.keys(customScheduleAmounts).length > 0;

  const selectedBorrowerName = borrowers.find(b => b.id === selectedBorrower)?.full_name;

  const handleSubmit = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: loanData, error } = await supabase
      .from('loan_entries')
      .insert({
        lender_id: user.id,
        borrower_id: selectedBorrower,
        principal_amount: principalNum,
        interest_rate: interestNum,
        duration_months: durationMonths,
        total_amount: totalAmount,
        due_date: dueDate,
        notes: notes.trim(),
        payment_frequency: paymentFrequency,
        grace_period_days: gracePeriodDays,
        penalty_type: penaltyType || null,
        penalty_rate: parseFloat(penaltyRate) || 0,
        penalty_frequency: penaltyFrequency || null,
      })
      .select('id')
      .single();

    if (!error && loanData) {
      const scheduleEntries = schedulePreview.map((entry) => ({
        loan_id: loanData.id,
        lender_id: user.id,
        borrower_id: selectedBorrower,
        due_date: entry.date,
        amount: Math.round(entry.amount * 100) / 100,
        status: 'pending',
      }));

      await supabase.from('payment_schedules').insert(scheduleEntries);

      setSuccess(true);
      setTimeout(() => router.push('/loans'), 1500);
    }
    setLoading(false);
  };

  const dueDateValid = dueDate && loanDate && new Date(dueDate) > new Date(loanDate);
  const scheduleAmountsValid = !hasCustomAmounts || scheduleDiff < 0.02;
  const withinBudget = availableToLend === null || principalNum <= availableToLend;
  const isValid = selectedBorrower && principalNum > 0 && loanDate && dueDateValid && notes.trim() && scheduleAmountsValid && withinBudget;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.push('/loans')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Loans
        </button>
        <div className="space-y-2">
          <p className="text-label-md text-muted-foreground">Financial Operations</p>
          <h1 className="text-display-md text-on-surface">Create Loan</h1>
          <p className="text-body-md text-muted-foreground">
            Initiate a new financial agreement by selecting a verified user and defining the core fiscal parameters.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Select User</Label>
          <Select value={selectedBorrower} onValueChange={(v) => setSelectedBorrower(v ?? '')}>
            <SelectTrigger className="h-12 bg-surface-lowest border-0 w-full">
              <SelectValue placeholder="Select a borrower...">
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
          <Label className="text-label-md text-muted-foreground">Principal Amount</Label>
          <CurrencyInput
            value={principal}
            onValueChange={setPrincipal}
            className="h-12 bg-surface-lowest border-0 text-on-surface"
            placeholder="0.00"
          />
          {availableToLend !== null && (
            <p className={`text-xs ${principalNum > availableToLend ? 'text-status-overdue' : 'text-muted-foreground'}`}>
              Available to lend: {formatCurrency(availableToLend)}
              {principalNum > availableToLend && ' — exceeds available funds'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Interest Rate (%)</Label>
          <Input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="h-12 bg-surface-lowest border-0 text-on-surface"
            placeholder="0"
            min="0"
            step="0.1"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Payment Frequency</Label>
          <Select value={paymentFrequency} onValueChange={(v) => setPaymentFrequency(v as 'monthly' | 'semi_monthly')}>
            <SelectTrigger className="h-12 bg-surface-lowest border-0">
              <SelectValue>
                {paymentFrequency === 'semi_monthly' ? 'Semi-monthly (2x/mo)' : 'Monthly'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-surface-lowest">
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="semi_monthly">Semi-monthly (2x/mo)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-label-md text-muted-foreground">Loan Duration</Label>
            <span className="text-headline-sm text-on-surface font-medium">
              {durationMonths} {durationMonths === 1 ? 'month' : 'months'}
              {paymentFrequency === 'semi_monthly' && (
                <span className="text-label-sm text-muted-foreground font-normal ml-1">
                  ({totalPayments} payments)
                </span>
              )}
            </span>
          </div>
          <div className="relative py-2">
            <input
              type="range"
              min={1}
              max={36}
              value={durationMonths}
              onChange={handleSliderChange}
              className="w-full h-2 appearance-none rounded-full bg-surface-low cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:cursor-grab
                [&::-webkit-slider-thumb]:active:cursor-grabbing
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-webkit-slider-thumb]:transition-transform
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-primary
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:cursor-grab
                [&::-moz-range-thumb]:active:cursor-grabbing"
              style={{
                background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((durationMonths - 1) / 35) * 100}%, var(--surface-low) ${((durationMonths - 1) / 35) * 100}%, var(--surface-low) 100%)`,
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">1 mo</span>
              <span className="text-[10px] text-muted-foreground">6 mo</span>
              <span className="text-[10px] text-muted-foreground">12 mo</span>
              <span className="text-[10px] text-muted-foreground">18 mo</span>
              <span className="text-[10px] text-muted-foreground">24 mo</span>
              <span className="text-[10px] text-muted-foreground">36 mo</span>
            </div>
          </div>
        </div>

        {/* Editable dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-label-md text-muted-foreground">Loan Date</Label>
            <Input
              type="date"
              value={loanDate}
              onChange={handleLoanDateChange}
              className="h-12 bg-surface-lowest border-0 text-on-surface"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-label-md text-muted-foreground">Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={handleDueDateChange}
              className="h-12 bg-surface-lowest border-0 text-on-surface"
            />
          </div>
        </div>
        {loanDate && dueDate && !dueDateValid && (
          <p className="text-xs text-status-overdue">Due date must be after the loan date.</p>
        )}

        {/* Late Payment Rules */}
        <div className="space-y-4">
          <p className="text-label-md text-muted-foreground">Late Payment Rules</p>
          <div className="space-y-2">
            <Label className="text-label-md text-muted-foreground">Grace Period (days)</Label>
            <Input
              type="number"
              value={gracePeriodDays || ''}
              onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 0)}
              className="h-12 bg-surface-lowest border-0 text-on-surface"
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-muted-foreground">Days after due date before penalty applies.</p>
          </div>
          <div className="space-y-2">
            <Label className="text-label-md text-muted-foreground">Penalty Type</Label>
            <Select value={penaltyType} onValueChange={(v) => setPenaltyType(v as 'percentage' | 'fixed_amount')}>
              <SelectTrigger className="h-12 bg-surface-lowest border-0">
                <SelectValue placeholder="Select penalty type...">
                  {penaltyType === 'percentage' ? 'Percentage' : penaltyType === 'fixed_amount' ? 'Fixed Amount' : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-surface-lowest">
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-label-md text-muted-foreground">
              Penalty Rate {penaltyType === 'percentage' ? '(%)' : penaltyType === 'fixed_amount' ? '(₱)' : ''}
            </Label>
            <Input
              type="number"
              value={penaltyRate}
              onChange={(e) => setPenaltyRate(e.target.value)}
              className="h-12 bg-surface-lowest border-0 text-on-surface"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-label-md text-muted-foreground">Penalty Frequency</Label>
            <Select value={penaltyFrequency} onValueChange={(v) => setPenaltyFrequency(v as 'daily' | 'monthly' | 'one_time')}>
              <SelectTrigger className="h-12 bg-surface-lowest border-0">
                <SelectValue placeholder="Select frequency...">
                  {penaltyFrequency === 'daily' ? 'Daily' : penaltyFrequency === 'monthly' ? 'Monthly' : penaltyFrequency === 'one_time' ? 'One-time' : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-surface-lowest">
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="one_time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-surface-lowest border-0 text-on-surface min-h-20 resize-none"
            placeholder="e.g. Purpose of loan, special terms, etc."
          />
          {!notes.trim() && (
            <p className="text-xs text-muted-foreground">Required — this helps identify the loan.</p>
          )}
        </div>

        <Button
          className="w-full h-12 btn-primary-gradient text-on-primary font-medium"
          onClick={handleSubmit}
          disabled={!isValid || loading}
        >
          {loading ? 'Creating...' : 'Create Loan'}
        </Button>

        {success && (
          <p className="text-sm text-status-ontime text-center">Loan created successfully! Redirecting...</p>
        )}
      </div>

      {/* Projection Preview */}
      {principalNum > 0 && (
        <div className="bg-inverse-surface rounded-md p-6 space-y-4">
          <h3 className="text-label-md text-on-primary/60">Projection Preview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-label-sm text-on-primary/40">Principal</p>
              <p className="text-headline-sm text-on-primary">
                {formatCurrency(principalNum)}
              </p>
            </div>
            <div>
              <p className="text-label-sm text-on-primary/40">Interest</p>
              <p className="text-headline-sm text-on-primary">
                {formatCurrency(interestAmount)}
              </p>
            </div>
            <div>
              <p className="text-label-sm text-on-primary/40">Total</p>
              <p className="text-headline-sm text-on-primary">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Payment Schedule Preview */}
      {principalNum > 0 && durationMonths > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-label-md text-muted-foreground">Payment Schedule</h3>
            <div className="flex items-center gap-2">
              <span className="text-label-sm text-muted-foreground">
                {formatCurrency(paymentAmount)}/{paymentFrequency === 'semi_monthly' ? 'payment' : 'mo'}
              </span>
              <button
                type="button"
                onClick={splitEvenly}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Split evenly
              </button>
            </div>
          </div>
          {hasCustomAmounts && (
            <p className={`text-xs ${scheduleDiff < 0.02 ? 'text-status-ontime' : 'text-status-overdue'}`}>
              Total: {formatCurrency(scheduleTotal)} / {formatCurrency(totalAmount)}
              {scheduleDiff >= 0.02 && ` (off by ${formatCurrency(scheduleDiff)})`}
            </p>
          )}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {schedulePreview.map((entry) => (
              <div
                key={entry.index}
                className="bg-surface-lowest rounded-md px-4 py-3 flex items-center gap-2"
              >
                <span className="text-xs text-muted-foreground w-6">#{entry.index + 1}</span>
                <Input
                  type="date"
                  value={entry.date}
                  onChange={(e) => handleScheduleDateChange(entry.index, e.target.value)}
                  className="h-8 bg-surface-high border-0 text-sm text-on-surface w-auto flex-1"
                />
                <CurrencyInput
                  value={customScheduleAmounts[entry.index] ?? String(entry.amount)}
                  onValueChange={(v) => handleScheduleAmountChange(entry.index, v)}
                  className="h-8 bg-surface-high border-0 text-sm text-on-surface w-28"
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
