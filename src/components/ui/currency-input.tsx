'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils';

interface CurrencyInputProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'type'> {
  value: string;
  onValueChange: (rawValue: string) => void;
}

function CurrencyInput({
  value,
  onValueChange,
  className,
  ...props
}: CurrencyInputProps) {
  const displayValue = formatCurrencyInput(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseCurrencyInput(e.target.value);
    onValueChange(raw);
  };

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/60 pointer-events-none">
        ₱
      </span>
      <Input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        className={cn('pl-8', className)}
        {...props}
      />
    </div>
  );
}

export { CurrencyInput };
