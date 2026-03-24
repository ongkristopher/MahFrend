'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [loanableAmount, setLoanableAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleComplete = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update profile
    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        is_onboarded: true,
      })
      .eq('id', user.id);

    // Create lending configuration
    if (loanableAmount) {
      await supabase
        .from('lending_configurations')
        .upsert(
          {
            lender_id: user.id,
            total_loanable_amount: parseFloat(loanableAmount),
          },
          { onConflict: 'lender_id' }
        );
    }

    // Hard redirect to force middleware to re-evaluate the session
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Progress */}
        <div className="flex gap-2">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-surface-high'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-surface-high'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-surface-high'}`} />
        </div>

        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-label-md text-muted-foreground">Step 1 of 3</p>
              <h1 className="text-display-md text-on-surface">Welcome MahFrend!</h1>
              <p className="text-body-lg text-muted-foreground">
                Let&apos;s set up your account. This will only take a moment.
              </p>
            </div>
            <Button
              className="w-full h-12 btn-primary-gradient text-on-primary font-medium"
              onClick={() => setStep(2)}
            >
              Get Started
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-label-md text-muted-foreground">Step 2 of 3</p>
              <h1 className="text-headline-lg text-on-surface">Your Profile</h1>
              <p className="text-body-md text-muted-foreground">
                How should we address you?
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-label-md text-muted-foreground">Full Name</Label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 bg-surface-high border-0 text-on-surface"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 h-12"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                className="flex-1 h-12 btn-primary-gradient text-on-primary font-medium"
                onClick={() => setStep(3)}
                disabled={!fullName.trim()}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-label-md text-muted-foreground">Step 3 of 3</p>
              <h1 className="text-headline-lg text-on-surface">Lending Capital</h1>
              <p className="text-body-md text-muted-foreground">
                Define your total loanable amount. You can change this later in Configuration.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-label-md text-muted-foreground">Total Loanable Amount</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface font-medium">₱</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={loanableAmount}
                    onChange={(e) => setLoanableAmount(e.target.value)}
                    className="h-12 bg-surface-high border-0 text-on-surface pl-8"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 h-12"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                className="flex-1 h-12 btn-primary-gradient text-on-primary font-medium"
                onClick={handleComplete}
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
