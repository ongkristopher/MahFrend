'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConfigurationPage() {
  const [loanableAmount, setLoanableAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState(0);
  const [totalLent, setTotalLent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchConfig = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [configRes, loansRes] = await Promise.all([
        supabase
          .from('lending_configurations')
          .select('total_loanable_amount')
          .eq('lender_id', user.id)
          .single(),
        supabase
          .from('loan_entries')
          .select('principal_amount')
          .eq('lender_id', user.id)
          .in('status', ['active', 'overdue']),
      ]);

      if (configRes.data) {
        setCurrentAmount(Number(configRes.data.total_loanable_amount));
        setLoanableAmount(configRes.data.total_loanable_amount.toString());
      }

      if (loansRes.data) {
        setTotalLent(loansRes.data.reduce((sum, l) => sum + Number(l.principal_amount), 0));
      }

      setLoading(false);
    };

    fetchConfig();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('lending_configurations')
      .upsert(
        {
          lender_id: user.id,
          total_loanable_amount: parseFloat(loanableAmount),
        },
        { onConflict: 'lender_id' }
      );

    setCurrentAmount(parseFloat(loanableAmount));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const utilization = currentAmount > 0 ? Math.round((totalLent / currentAmount) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-label-md text-muted-foreground">System Configuration</p>
        <h1 className="text-display-md text-on-surface">Configuration</h1>
        <p className="text-body-md text-muted-foreground">
          Define the liquidity threshold for the platform. This amount dictates the maximum combined value of all active disbursements.
        </p>
      </div>

      {/* Loanable Amount Card */}
      <div className="bg-surface-lowest rounded-md p-6 space-y-6">
        <div className="space-y-2">
          <Label className="text-label-md text-muted-foreground">Total Loanable Amount</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-on-surface font-semibold">₱</span>
            <Input
              type="number"
              value={loanableAmount}
              onChange={(e) => setLoanableAmount(e.target.value)}
              className="h-16 bg-surface-high border-0 text-2xl font-semibold text-on-surface pl-10"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          {currentAmount > 0 && (
            <p className="text-label-sm text-muted-foreground">
              Current cycle limit: ${currentAmount.toLocaleString()} maximum allowed
            </p>
          )}
        </div>

        <Button
          className="w-full h-12 btn-primary-gradient text-on-primary font-medium"
          onClick={handleSave}
          disabled={saving || !loanableAmount}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Configuration'}
        </Button>
      </div>

      {/* Financial Guardrails */}
      {currentAmount > 0 && (
        <div className="bg-surface-lowest rounded-md p-6 space-y-4">
          <h2 className="text-label-md text-muted-foreground">Financial Guardrails</h2>
          <p className="text-body-md text-muted-foreground">
            Updates to the loanable amount trigger an immediate recalculation of available credit across all clients.
          </p>

          {/* Utilization Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-label-sm text-muted-foreground">Capital Utilization</span>
              <span className="text-headline-lg text-on-surface">{utilization}%</span>
            </div>
            <div className="h-2 bg-surface-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
