'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import type { Borrower, LoanEntry } from '@/types/database';

export default function NewPaymentPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [loans, setLoans] = useState<LoanEntry[]>([]);
  const [selectedLoan, setSelectedLoan] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
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

  useEffect(() => {
    const fetchLoans = async () => {
      if (!selectedBorrower) {
        setLoans([]);
        setSelectedLoan('');
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

      if (data) setLoans(data);
    };

    fetchLoans();
  }, [selectedBorrower, supabase]);

  const selectedLoanData = loans.find((l) => l.id === selectedLoan);
  const remaining = selectedLoanData
    ? Number(selectedLoanData.total_amount) - Number(selectedLoanData.amount_paid)
    : 0;

  const selectedBorrowerName = borrowers.find(b => b.id === selectedBorrower)?.full_name;
  const selectedLoanLabel = selectedLoanData
    ? `₱${Number(selectedLoanData.total_amount).toLocaleString()} — Due ${format(new Date(selectedLoanData.due_date), 'MMM d, yyyy')}`
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
      const newAmountPaid = Number(selectedLoanData!.amount_paid) + payAmount;
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
                  ₱{Number(l.total_amount).toLocaleString()} — Due {format(new Date(l.due_date), 'MMM d, yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Payment Amount (₱)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-12 bg-surface-lowest border-0 text-on-surface"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {selectedLoanData && (
            <p className="text-label-sm text-muted-foreground">
              Remaining balance: ₱{remaining.toLocaleString()}
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
                ₱{parseFloat(amount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-label-sm text-on-primary/40">New Balance</p>
              <p className="text-headline-sm text-on-primary">
                ₱{Math.max(0, remaining - parseFloat(amount)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
