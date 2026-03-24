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
import { addMonths, differenceInCalendarMonths, format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import type { Borrower } from '@/types/database';

export default function NewLoanPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [loanDate, setLoanDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(addMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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

      if (data) setBorrowers(data);
    };

    fetchBorrowers();
  }, [supabase]);

  const principalNum = parseFloat(principal) || 0;
  const interestNum = parseFloat(interestRate) || 0;
  const interestAmount = principalNum * (interestNum / 100);
  const totalAmount = principalNum + interestAmount;
  const monthlyPayment = durationMonths > 0 ? totalAmount / durationMonths : 0;

  // When slider changes → recalculate due date from loan date
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const months = parseInt(e.target.value);
    setDurationMonths(months);
    setDueDate(format(addMonths(new Date(loanDate), months), 'yyyy-MM-dd'));
  }, [loanDate]);

  // When loan date changes → recalculate due date from tenure
  const handleLoanDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLoanDate = e.target.value;
    setLoanDate(newLoanDate);
    setDueDate(format(addMonths(new Date(newLoanDate), durationMonths), 'yyyy-MM-dd'));
  };

  // When due date changes → recalculate tenure from dates
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDueDate = e.target.value;
    setDueDate(newDueDate);
    const months = Math.max(1, differenceInCalendarMonths(new Date(newDueDate), new Date(loanDate)));
    setDurationMonths(Math.min(60, months));
  };

  // Generate schedule preview
  const schedulePreview = Array.from({ length: durationMonths }, (_, i) => ({
    month: i + 1,
    date: addMonths(new Date(loanDate), i + 1),
    amount: monthlyPayment,
  }));

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
        notes: notes || null,
      })
      .select('id')
      .single();

    if (!error && loanData) {
      const scheduleEntries = Array.from({ length: durationMonths }, (_, i) => ({
        loan_id: loanData.id,
        lender_id: user.id,
        borrower_id: selectedBorrower,
        due_date: format(addMonths(new Date(loanDate), i + 1), 'yyyy-MM-dd'),
        amount: Math.round(monthlyPayment * 100) / 100,
        status: 'pending',
      }));

      await supabase.from('payment_schedules').insert(scheduleEntries);

      setSuccess(true);
      setTimeout(() => router.push('/loans'), 1500);
    }
    setLoading(false);
  };

  const isValid = selectedBorrower && principalNum > 0 && loanDate && dueDate;

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
            <SelectTrigger className="h-12 bg-surface-lowest border-0">
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-label-md text-muted-foreground">Loan Duration</Label>
            <span className="text-headline-sm text-on-surface font-medium">
              {durationMonths} {durationMonths === 1 ? 'month' : 'months'}
            </span>
          </div>
          <div className="relative py-2">
            <input
              type="range"
              min={1}
              max={60}
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
                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((durationMonths - 1) / 59) * 100}%, hsl(var(--surface-low)) ${((durationMonths - 1) / 59) * 100}%, hsl(var(--surface-low)) 100%)`,
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">1 mo</span>
              <span className="text-[10px] text-muted-foreground">12 mo</span>
              <span className="text-[10px] text-muted-foreground">24 mo</span>
              <span className="text-[10px] text-muted-foreground">36 mo</span>
              <span className="text-[10px] text-muted-foreground">48 mo</span>
              <span className="text-[10px] text-muted-foreground">60 mo</span>
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

        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Notes (Optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-surface-lowest border-0 text-on-surface min-h-20 resize-none"
            placeholder="e.g. Purpose of loan, special terms, etc."
          />
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
            <h3 className="text-label-md text-muted-foreground">Monthly Payment Schedule</h3>
            <span className="text-label-sm text-muted-foreground">
              {formatCurrency(monthlyPayment)}/mo
            </span>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {schedulePreview.map((entry) => (
              <div
                key={entry.month}
                className="bg-surface-lowest rounded-md px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-6">#{entry.month}</span>
                  <span className="text-sm text-on-surface">
                    {format(entry.date, 'MMM d, yyyy')}
                  </span>
                </div>
                <span className="text-sm font-medium text-on-surface">
                  {formatCurrency(entry.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
