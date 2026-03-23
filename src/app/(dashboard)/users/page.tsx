'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Borrower } from '@/types/database';

export default function UsersPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState<Borrower | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loanCounts, setLoanCounts] = useState<Record<string, { count: number; hasOverdue: boolean }>>({});
  const router = useRouter();
  const supabase = createClient();

  const fetchBorrowers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('borrowers')
      .select('*')
      .eq('lender_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBorrowers(data);

      // Fetch loan counts
      const { data: loans } = await supabase
        .from('loan_entries')
        .select('borrower_id, status')
        .eq('lender_id', user.id);

      if (loans) {
        const counts: Record<string, { count: number; hasOverdue: boolean }> = {};
        loans.forEach((loan) => {
          if (!counts[loan.borrower_id]) {
            counts[loan.borrower_id] = { count: 0, hasOverdue: false };
          }
          counts[loan.borrower_id].count++;
          if (loan.status === 'overdue') {
            counts[loan.borrower_id].hasOverdue = true;
          }
        });
        setLoanCounts(counts);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingBorrower) {
      await supabase
        .from('borrowers')
        .update({
          full_name: formName,
          email: formEmail || null,
          phone: formPhone || null,
          notes: formNotes || null,
        })
        .eq('id', editingBorrower.id);
    } else {
      await supabase.from('borrowers').insert({
        lender_id: user.id,
        full_name: formName,
        email: formEmail || null,
        phone: formPhone || null,
        notes: formNotes || null,
      });
    }

    setDialogOpen(false);
    resetForm();
    setSaving(false);
    fetchBorrowers();
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormNotes('');
    setEditingBorrower(null);
  };

  const openEdit = (borrower: Borrower) => {
    setEditingBorrower(borrower);
    setFormName(borrower.full_name);
    setFormEmail(borrower.email || '');
    setFormPhone(borrower.phone || '');
    setFormNotes(borrower.notes || '');
    setDialogOpen(true);
  };

  const toggleStatus = async (borrower: Borrower) => {
    const newStatus = borrower.status === 'active' ? 'inactive' : 'active';
    await supabase
      .from('borrowers')
      .update({ status: newStatus })
      .eq('id', borrower.id);
    fetchBorrowers();
  };

  const filtered = borrowers.filter(
    (b) =>
      b.full_name.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase()) ||
      ''
  );

  const getStatusLabel = (borrower: Borrower) => {
    const loanInfo = loanCounts[borrower.id];
    if (borrower.status === 'inactive') return { text: 'Inactive', style: 'text-muted-foreground' };
    if (loanInfo?.hasOverdue) return { text: `Overdue (${loanInfo.count} Loan${loanInfo.count > 1 ? 's' : ''})`, style: 'text-status-overdue' };
    if (loanInfo?.count) return { text: `Active (${loanInfo.count} Loan${loanInfo.count > 1 ? 's' : ''})`, style: 'text-status-ontime' };
    return { text: 'Active', style: 'text-muted-foreground' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-display-md text-on-surface">Users</h1>
        <p className="text-body-md text-muted-foreground">
          Manage your lending network. View active borrower profiles, loan performance, and contact information.
        </p>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-surface-lowest border-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="secondary" className="h-9 bg-surface-lowest text-sm">
          <SlidersHorizontal size={14} className="mr-2" />
          Filter
        </Button>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger
            className="inline-flex items-center justify-center h-9 px-4 rounded-md btn-primary-gradient text-on-primary text-sm font-medium cursor-pointer"
          >
            <Plus size={14} className="mr-2" />
            Add User
          </DialogTrigger>
          <DialogContent className="bg-surface-lowest max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-headline-md">
                {editingBorrower ? 'Edit User' : 'Add New User'}
              </DialogTitle>
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
                {saving ? 'Saving...' : editingBorrower ? 'Update User' : 'Add User'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* User List */}
      <div className="space-y-2">
        {/* Table header */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-label-sm text-muted-foreground flex-1">Borrower Info</span>
          <span className="text-label-sm text-muted-foreground w-32 text-right">Loan Status</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-lowest rounded-md p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-body-md">
              {borrowers.length === 0
                ? 'No users yet. Add your first borrower to get started.'
                : 'No results found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((borrower) => {
              const status = getStatusLabel(borrower);
              return (
                <button
                  key={borrower.id}
                  onClick={() => router.push(`/users/${borrower.id}`)}
                  className="w-full bg-surface-lowest rounded-md p-4 flex items-center justify-between text-left hover:bg-surface-low/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {borrower.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {borrower.email || borrower.phone || 'No contact info'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${status.style}`}>
                      {status.text}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        borrower.status === 'active' ? 'bg-status-ontime' : 'bg-muted-foreground'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-label-sm text-muted-foreground px-4 pt-2">
            Showing {filtered.length} of {borrowers.length} users
          </p>
        )}
      </div>
    </div>
  );
}
