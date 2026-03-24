'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
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
import { format } from 'date-fns';
import { formatCurrency, safeDate } from '@/lib/utils';
import type { LoanEntry } from '@/types/database';

export default function EditLoanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [loan, setLoan] = useState<LoanEntry | null>(null);
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [gracePeriodDays, setGracePeriodDays] = useState(0);
  const [penaltyType, setPenaltyType] = useState<'percentage' | 'fixed_amount' | ''>('');
  const [penaltyRate, setPenaltyRate] = useState('');
  const [penaltyFrequency, setPenaltyFrequency] = useState<'daily' | 'monthly' | 'one_time' | ''>('');
  const [status, setStatus] = useState<'active' | 'paid' | 'overdue' | 'defaulted'>('active');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchLoan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('loan_entries')
        .select('*, borrower:borrowers(full_name)')
        .eq('id', id)
        .eq('lender_id', user.id)
        .single();

      if (data) {
        setLoan(data);
        setPrincipal(String(data.principal_amount));
        setInterestRate(String(data.interest_rate));
        setDueDate(data.due_date);
        setNotes(data.notes || '');
        setGracePeriodDays(data.grace_period_days || 0);
        setPenaltyType(data.penalty_type || '');
        setPenaltyRate(String(data.penalty_rate || ''));
        setPenaltyFrequency(data.penalty_frequency || '');
        setStatus(data.status);
        if (data.grace_period_days > 0) setAdvancedOpen(true);
      }
      setLoading(false);
    };

    fetchLoan();
  }, [id, supabase]);

  const principalNum = parseFloat(principal) || 0;
  const interestNum = parseFloat(interestRate) || 0;
  const interestAmount = principalNum * (interestNum / 100);
  const totalAmount = principalNum + interestAmount;

  const borrowerName = loan
    ? (loan.borrower as unknown as { full_name: string })?.full_name ?? 'Unknown'
    : '';

  const handleSubmit = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !loan) return;

    const { error } = await supabase
      .from('loan_entries')
      .update({
        principal_amount: principalNum,
        interest_rate: interestNum,
        total_amount: totalAmount,
        due_date: dueDate,
        notes: notes || null,
        status,
        grace_period_days: gracePeriodDays,
        penalty_type: penaltyType || null,
        penalty_rate: parseFloat(penaltyRate) || 0,
        penalty_frequency: penaltyFrequency || null,
      })
      .eq('id', id);

    if (!error) {
      setSuccess(true);
      setTimeout(() => router.push(`/loans/${id}`), 1000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface-lowest rounded-md p-6 animate-pulse h-40" />
        <div className="bg-surface-lowest rounded-md p-6 animate-pulse h-64" />
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

  const dueDateObj = safeDate(dueDate);
  const isValid = principalNum > 0 && dueDateObj;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.push(`/loans/${id}`)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Loan
        </button>
        <div className="space-y-2">
          <p className="text-label-md text-muted-foreground">Edit Loan</p>
          <h1 className="text-display-md text-on-surface">{borrowerName}</h1>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="h-12 bg-surface-lowest border-0">
              <SelectValue>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-surface-lowest">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="defaulted">Defaulted</SelectItem>
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

        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Due Date</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-12 bg-surface-lowest border-0 text-on-surface"
          />
        </div>

        {/* Advanced: Late Payment Rules */}
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
        >
          <ChevronDown size={14} className={`transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
          Late Payment Rules
        </button>
        {advancedOpen && (
          <div className="space-y-4 bg-surface-lowest rounded-md p-4">
            <div className="space-y-2">
              <Label className="text-label-md text-muted-foreground">Grace Period (days)</Label>
              <Input
                type="number"
                value={gracePeriodDays || ''}
                onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 0)}
                className="h-10 bg-surface-high border-0 text-on-surface"
                placeholder="0"
                min="0"
              />
            </div>
            {gracePeriodDays > 0 && (
              <>
                <div className="space-y-2">
                  <Label className="text-label-md text-muted-foreground">Penalty Type</Label>
                  <Select value={penaltyType} onValueChange={(v) => setPenaltyType(v as 'percentage' | 'fixed_amount')}>
                    <SelectTrigger className="h-10 bg-surface-high border-0">
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
                    className="h-10 bg-surface-high border-0 text-on-surface"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-label-md text-muted-foreground">Penalty Frequency</Label>
                  <Select value={penaltyFrequency} onValueChange={(v) => setPenaltyFrequency(v as 'daily' | 'monthly' | 'one_time')}>
                    <SelectTrigger className="h-10 bg-surface-high border-0">
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
              </>
            )}
          </div>
        )}

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
          disabled={!isValid || saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>

        {success && (
          <p className="text-sm text-status-ontime text-center">Changes saved! Redirecting...</p>
        )}
      </div>

      {/* Updated Projection */}
      {principalNum > 0 && (
        <div className="bg-inverse-surface rounded-md p-6 space-y-4">
          <h3 className="text-label-md text-on-primary/60">Updated Projection</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-label-sm text-on-primary/40">Principal</p>
              <p className="text-headline-sm text-on-primary">{formatCurrency(principalNum)}</p>
            </div>
            <div>
              <p className="text-label-sm text-on-primary/40">Interest</p>
              <p className="text-headline-sm text-on-primary">{formatCurrency(interestAmount)}</p>
            </div>
            <div>
              <p className="text-label-sm text-on-primary/40">Total</p>
              <p className="text-headline-sm text-on-primary">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
          {loan && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-on-primary/10">
              <div>
                <p className="text-label-sm text-on-primary/40">Amount Paid</p>
                <p className="text-headline-sm text-on-primary">{formatCurrency(loan.amount_paid)}</p>
              </div>
              <div>
                <p className="text-label-sm text-on-primary/40">Remaining</p>
                <p className="text-headline-sm text-on-primary">{formatCurrency(totalAmount - Number(loan.amount_paid))}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
