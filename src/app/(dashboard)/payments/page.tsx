'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { formatCurrency, toDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CurrencyInput } from '@/components/ui/currency-input';

interface PaymentRow {
  id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
  loan: { id: string; total_amount: number; notes: string | null; borrower: { full_name: string } };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<PaymentRow | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const fetchPayments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('payments')
      .select('id, amount, payment_date, notes, created_at, loan:loan_entries(id, total_amount, notes, borrower:borrowers(full_name))')
      .eq('lender_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setPayments(data as unknown as PaymentRow[]);
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('payments')
        .select('id, amount, payment_date, notes, created_at, loan:loan_entries(id, total_amount, notes, borrower:borrowers(full_name))')
        .eq('lender_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setPayments(data as unknown as PaymentRow[]);
      setLoading(false);
    };

    load();
  }, [supabase]);

  const handleEditOpen = (payment: PaymentRow) => {
    setEditingPayment(payment);
    setEditAmount(payment.amount.toString());
    setEditDate(payment.payment_date);
    setEditNotes(payment.notes || '');
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingPayment) return;

    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) return;

    const oldAmount = editingPayment.amount;
    const difference = newAmount - oldAmount;
    const loanId = editingPayment.loan.id;

    // Update the payment record
    const { error } = await supabase
      .from('payments')
      .update({
        amount: newAmount,
        payment_date: editDate,
        notes: editNotes || null,
      })
      .eq('id', editingPayment.id);

    if (error) return;

    // Get current loan data
    const { data: loanData } = await supabase
      .from('loan_entries')
      .select('amount_paid, total_amount')
      .eq('id', loanId)
      .single();

    if (loanData) {
      const newAmountPaid = Number(loanData.amount_paid) + difference;
      const newStatus = newAmountPaid >= Number(loanData.total_amount) ? 'paid' : 'active';

      await supabase
        .from('loan_entries')
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
        })
        .eq('id', loanId);
    }

    setEditOpen(false);
    setEditingPayment(null);
    fetchPayments();
  };

  const handleDelete = async (payment: PaymentRow) => {
    setDeleting(payment.id);

    const loanId = payment.loan.id;

    // Delete the payment
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', payment.id);

    if (error) {
      setDeleting('');
      return;
    }

    // Get current loan data
    const { data: loanData } = await supabase
      .from('loan_entries')
      .select('amount_paid, total_amount, status')
      .eq('id', loanId)
      .single();

    if (loanData) {
      const newAmountPaid = Math.max(0, Number(loanData.amount_paid) - payment.amount);
      const newStatus = loanData.status === 'paid' ? 'active' : loanData.status;

      await supabase
        .from('loan_entries')
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
        })
        .eq('id', loanId);
    }

    // Revert paid schedules to cover the deleted payment amount
    // Fetch paid schedules for this loan, most recent first
    const { data: paidSchedules } = await supabase
      .from('payment_schedules')
      .select('id, amount')
      .eq('loan_id', loanId)
      .eq('status', 'paid')
      .order('due_date', { ascending: false });

    if (paidSchedules) {
      let remaining = payment.amount;
      const toRevert: string[] = [];
      for (const s of paidSchedules) {
        if (remaining <= 0) break;
        toRevert.push(s.id);
        remaining -= Number(s.amount);
      }
      if (toRevert.length > 0) {
        await supabase
          .from('payment_schedules')
          .update({ status: 'pending', paid_at: null, amount_paid: 0, penalty_paid: 0 })
          .in('id', toRevert);
      }

      // Also reset any partially-paid pending schedules for this loan
      const { data: pendingWithPartial } = await supabase
        .from('payment_schedules')
        .select('id')
        .eq('loan_id', loanId)
        .eq('status', 'pending')
        .gt('amount_paid', 0);

      if (pendingWithPartial && pendingWithPartial.length > 0) {
        await supabase
          .from('payment_schedules')
          .update({ amount_paid: 0, penalty_paid: 0 })
          .in('id', pendingWithPartial.map(s => s.id));
      }
    }

    setDeleting('');
    fetchPayments();
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const borrowerName = payment.loan?.borrower?.full_name ?? '';
    const loanNotes = payment.loan?.notes ?? '';
    const paymentNotes = payment.notes ?? '';
    return (
      borrowerName.toLowerCase().includes(q) ||
      loanNotes.toLowerCase().includes(q) ||
      paymentNotes.toLowerCase().includes(q)
    );
  });

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

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 bg-surface-lowest border-0 text-on-surface pl-9"
          placeholder="Search by borrower, loan notes, or payment notes..."
        />
      </div>

      {/* Table */}
      <div className="space-y-1">
        <div className="grid grid-cols-[1fr_90px_90px_1fr_36px] gap-2 px-4 py-2">
          <span className="text-label-sm text-muted-foreground">Borrower</span>
          <span className="text-label-sm text-muted-foreground text-right">Amount</span>
          <span className="text-label-sm text-muted-foreground text-right">Date</span>
          <span className="text-label-sm text-muted-foreground text-right">Notes</span>
          <span />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-lowest rounded-md p-4 animate-pulse h-14" />
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-body-md">
              {payments.length === 0 ? 'No payments recorded yet.' : 'No payments match your search.'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredPayments.map((payment) => {
              const borrowerName = payment.loan?.borrower?.full_name ?? 'Unknown';
              const loanNotes = payment.loan?.notes;
              return (
                <div
                  key={payment.id}
                  className="bg-surface-lowest rounded-md p-4 space-y-1"
                >
                  <div className="grid grid-cols-[1fr_90px_90px_1fr_36px] gap-2 items-center">
                    <p className="text-sm font-medium text-on-surface truncate">{borrowerName}</p>
                    <p className="text-sm text-green-500 font-medium text-right">
                      {formatCurrency(payment.amount, { sign: true })}
                    </p>
                    <p className="text-xs text-muted-foreground text-right">
                      {format(toDate(payment.payment_date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground text-right truncate">
                      {payment.notes || '—'}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-1 rounded hover:bg-surface-low transition-colors"
                      >
                        <MoreHorizontal size={16} className="text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditOpen(payment)}>
                          <Pencil size={14} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => handleDelete(payment)}
                          disabled={deleting === payment.id}
                        >
                          <Trash2 size={14} className="mr-2" />
                          {deleting === payment.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {loanNotes && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      Loan: {loanNotes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filteredPayments.length > 0 && (
          <p className="text-label-sm text-muted-foreground px-4 pt-2">
            {filteredPayments.length} payment{filteredPayments.length === 1 ? '' : 's'}
            {searchQuery.trim() && payments.length !== filteredPayments.length && ` (of ${payments.length})`}
          </p>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-label-md text-muted-foreground">Amount</label>
              <CurrencyInput
                value={editAmount}
                onValueChange={setEditAmount}
                className="h-12 bg-surface-lowest border-0 text-on-surface"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-label-md text-muted-foreground">Payment Date</label>
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="h-12 bg-surface-lowest border-0 text-on-surface"
              />
            </div>
            <div className="space-y-2">
              <label className="text-label-md text-muted-foreground">Notes</label>
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="h-10 bg-surface-lowest border-0 text-on-surface"
                placeholder="Optional notes"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                className="btn-primary-gradient text-on-primary"
                onClick={handleEditSave}
                disabled={!editAmount || parseFloat(editAmount) <= 0}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
