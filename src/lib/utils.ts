import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Philippine Peso currency: ₱100,000.00
 */
export function formatCurrency(
  value: number | string,
  options?: { decimals?: boolean; sign?: boolean }
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '₱0.00';

  const showDecimals = options?.decimals ?? true;
  const showSign = options?.sign ?? false;

  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  const prefix = showSign ? (num >= 0 ? '+' : '-') : (num < 0 ? '-' : '');
  return `${prefix}₱${formatted}`;
}

/**
 * Parse a currency-formatted string back to a number.
 * Strips ₱, commas, and whitespace.
 */
export function parseCurrencyInput(value: string): string {
  return value.replace(/[₱,\s]/g, '');
}

/**
 * Format a raw numeric string for display in an input field: 100,000.00
 */
export function formatCurrencyInput(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, '');

  const parts = cleaned.split('.');
  if (parts.length > 2) return formatCurrencyInput(parts[0] + '.' + parts.slice(1).join(''));

  const intPart = parts[0];
  const decPart = parts.length > 1 ? '.' + parts[1].slice(0, 2) : '';

  const formattedInt = intPart ? Number(intPart).toLocaleString('en-US') : '';
  if (formattedInt === 'NaN') return '';

  return formattedInt + decPart;
}
