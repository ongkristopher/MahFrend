'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, FileText, Pencil, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { formatCurrency, toDate } from '@/lib/utils';
import type { Borrower, LoanEntry, PaymentSchedule } from '@/types/database';

interface PaymentRow {
  id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  loan_id: string;
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [loans, setLoans] = useState<LoanEntry[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLoans, setExpandedLoans] = useState<Set<string>>(new Set());

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [borrowerRes, loansRes] = await Promise.all([
      supabase
        .from('borrowers')
        .select('*')
        .eq('id', id)
        .eq('lender_id', user.id)
        .single(),
      supabase
        .from('loan_entries')
        .select('*')
        .eq('borrower_id', id)
        .eq('lender_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    if (borrowerRes.data) setBorrower(borrowerRes.data);
    if (loansRes.data) {
      setLoans(loansRes.data);

      const loanIds = loansRes.data.map((l) => l.id);
      if (loanIds.length > 0) {
        const [paymentRes, scheduleRes] = await Promise.all([
          supabase
            .from('payments')
            .select('id, amount, payment_date, notes, loan_id')
            .in('loan_id', loanIds)
            .eq('lender_id', user.id)
            .order('payment_date', { ascending: false }),
          supabase
            .from('payment_schedules')
            .select('*')
            .in('loan_id', loanIds)
            .eq('lender_id', user.id)
            .order('due_date', { ascending: true }),
        ]);

        if (paymentRes.data) setPayments(paymentRes.data);
        if (scheduleRes.data) setSchedules(scheduleRes.data);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id, supabase]);

  const toggleLoan = (loanId: string) => {
    setExpandedLoans((prev) => {
      const next = new Set(prev);
      if (next.has(loanId)) next.delete(loanId);
      else next.add(loanId);
      return next;
    });
  };

  const openEditDialog = () => {
    if (!borrower) return;
    setFormName(borrower.full_name);
    setFormEmail(borrower.email || '');
    setFormPhone(borrower.phone || '');
    setFormNotes(borrower.notes || '');
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!borrower) return;
    setSaving(true);

    await supabase
      .from('borrowers')
      .update({
        full_name: formName,
        email: formEmail || null,
        phone: formPhone || null,
        notes: formNotes || null,
      })
      .eq('id', borrower.id);

    setEditOpen(false);
    setSaving(false);
    setLoading(true);
    fetchData();
  };

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
        <div className="bg-surface-lowest rounded-md p-6 animate-pulse h-32" />
        <div className="bg-surface-lowest rounded-md p-6 animate-pulse h-48" />
        <div className="bg-surface-lowest rounded-md p-6 animate-pulse h-48" />
      </div>
    );
  }

  if (!borrower) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  const totalLent = loans.reduce((sum, l) => sum + Number(l.principal_amount), 0);
  const totalOwed = loans
    .filter((l) => l.status !== 'paid')
    .reduce((sum, l) => sum + (Number(l.total_amount) - Number(l.amount_paid)), 0);

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push('/users')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Users
      </button>

      {/* User Info */}
      <div className="bg-surface-lowest rounded-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-md text-on-surface">{borrower.full_name}</h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
              borrower.status === 'active' ? 'text-status-ontime bg-status-ontime/10' : 'text-muted-foreground bg-muted-foreground/10'
            }`}>
              {borrower.status}
            </span>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 bg-surface-low"
            onClick={openEditDialog}
          >
            <Pencil size={14} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {borrower.email && (
            <span className="flex items-center gap-1.5">
              <Mail size={14} /> {borrower.email}
            </span>
          )}
          {borrower.phone && (
            <span className="flex items-center gap-1.5">
              <Phone size={14} /> {borrower.phone}
            </span>
          )}
          {borrower.notes && (
            <span className="flex items-center gap-1.5">
              <FileText size={14} /> {borrower.notes}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div>
            <p className="text-label-sm text-muted-foreground">Total Lent</p>
            <p className="text-headline-sm text-on-surface">{formatCurrency(totalLent)}</p>
          </div>
          <div>
            <p className="text-label-sm text-muted-foreground">Outstanding</p>
            <p className="text-headline-sm text-on-surface">{formatCurrency(totalOwed)}</p>
          </div>
          <div>
            <p className="text-label-sm text-muted-foreground">Loans</p>
            <p className="text-headline-sm text-on-surface">{loans.length}</p>
          </div>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-surface-lowest max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-headline-md">Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-label-md text-muted-foreground">Full Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="h-10 bg-surface-high border-0"
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-label-md text-muted-foreground">Email</Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="h-10 bg-surface-high border-0"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-label-md text-muted-foreground">Phone</Label>
              <Input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="h-10 bg-surface-high border-0"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-label-md text-muted-foreground">Notes</Label>
              <Input
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="h-10 bg-surface-high border-0"
                placeholder="Optional"
              />
            </div>
            <Button
              className="w-full h-10 btn-primary-gradient text-on-primary font-medium"
              onClick={handleSave}
              disabled={saving || !formName.trim()}
            >
              {saving ? 'Saving...' : 'Update User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loan Entries (Collapsible) */}
      <div className="space-y-3">
        <h2 className="text-headline-sm text-on-surface">Loan Entries</h2>

        {loans.length === 0 ? (
          <div className="text-center py-8 bg-surface-lowest rounded-md">
            <p className="text-muted-foreground text-sm">No loans for this user.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {loans.map((loan) => {
              const isExpanded = expandedLoans.has(loan.id);
              const loanSchedules = schedules.filter((s) => s.loan_id === loan.id);
              const paidCount = loanSchedules.filter((s) => s.status === 'paid').length;
              const totalMonths = loanSchedules.length;

              return (
                <div key={loan.id} className="bg-surface-lowest rounded-md overflow-hidden">
                  {/* Loan header (clickable) */}
                  <button
                    onClick={() => toggleLoan(loan.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-low/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isExpanded ? <ChevronDown size={14} className="text-muted-foreground shrink-0" /> : <ChevronRight size={14} className="text-muted-foreground shrink-0" />}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-on-surface">
                            {formatCurrency(loan.principal_amount)}
                          </p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${statusStyle(loan.status)}`}>
                            {loan.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Due {format(toDate(loan.due_date), 'MMM d, yyyy')} · {formatCurrency(loan.amount_paid)} / {formatCurrency(loan.total_amount)} paid
                        </p>
                      </div>
                    </div>
                    {totalMonths > 0 && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {paidCount}/{totalMonths} mo
                      </span>
                    )}
                  </button>

                  {/* Expanded: schedule */}
                  {isExpanded && (
                    <div className="border-t border-surface-low px-4 pb-4 pt-3 space-y-1">
                      <p className="text-label-sm text-muted-foreground mb-2">Payment Schedule</p>
                      {loanSchedules.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No schedule found.</p>
                      ) : (
                        loanSchedules.map((s, i) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between py-1.5"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${
                                s.status === 'paid' ? 'bg-muted-foreground' : 'bg-status-ontime'
                              }`} />
                              <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                              <span className="text-sm text-on-surface">
                                {format(toDate(s.due_date), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-on-surface">
                                {formatCurrency(s.amount)}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                                s.status === 'paid' ? 'text-muted-foreground bg-muted-foreground/10' : 'text-status-ontime bg-status-ontime/10'
                              }`}>
                                {s.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
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
            <p className="text-muted-foreground text-sm">No payments recorded.</p>
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
