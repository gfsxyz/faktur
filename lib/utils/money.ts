/**
 * Utility functions for handling monetary calculations with proper precision
 * to avoid floating point arithmetic errors
 */

/**
 * Rounds a monetary value to 2 decimal places
 */
export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Compares two monetary values for equality with tolerance for floating point errors
 * Uses an epsilon of 0.01 (1 cent) for comparison
 */
export function moneyEquals(a: number, b: number): boolean {
  return Math.abs(roundMoney(a) - roundMoney(b)) < 0.01;
}

/**
 * Checks if monetary value a is greater than or equal to b
 * with tolerance for floating point errors
 */
export function moneyGreaterThanOrEqual(a: number, b: number): boolean {
  const roundedA = roundMoney(a);
  const roundedB = roundMoney(b);
  return roundedA >= roundedB || Math.abs(roundedA - roundedB) < 0.01;
}

/**
 * Checks if monetary value a is less than b
 * with tolerance for floating point errors
 */
export function moneyLessThan(a: number, b: number): boolean {
  const roundedA = roundMoney(a);
  const roundedB = roundMoney(b);
  return roundedA < roundedB && Math.abs(roundedA - roundedB) >= 0.01;
}

/**
 * Adds two monetary values with proper rounding
 */
export function moneyAdd(a: number, b: number): number {
  return roundMoney(a + b);
}

/**
 * Subtracts two monetary values with proper rounding
 */
export function moneySubtract(a: number, b: number): number {
  return roundMoney(a - b);
}

/**
 * Multiplies a monetary value with proper rounding
 */
export function moneyMultiply(a: number, b: number): number {
  return roundMoney(a * b);
}

/**
 * Format a monetary value as currency with proper thousands separators
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(
  amount: number,
  options?: {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const {
    locale = "en-US",
    currency = "USD",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options || {};

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Formats a monetary value for chart display
 * Shows values like $1.5M, $600K, or $150 depending on magnitude
 */
export function formatCurrencyForChart(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return formatCurrency(value, { minimumFractionDigits: 0 });
}
