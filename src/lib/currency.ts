/**
 * Format a number as currency using the Intl API.
 *
 * @param amount - The numeric amount
 * @param currencyCode - ISO 4217 code (e.g., "USD", "GBP", "EUR")
 * @param locale - Full locale string (e.g., "en-US", "ja-JP")
 * @param options - Optional overrides
 * @returns Formatted string like "$1,234.56" or "\u00a5123,456"
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale: string,
  options?: Partial<Intl.NumberFormatOptions>,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    ...options,
  }).format(amount);
}

/**
 * Format a number using locale-aware thousand/decimal separators.
 * Useful for non-currency numbers that still need locale formatting.
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Partial<Intl.NumberFormatOptions>,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Get the currency symbol for a given currency code and locale.
 * Useful for input field prefixes.
 */
export function getCurrencySymbol(
  currencyCode: string,
  locale: string,
): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(0);

  // Strip the zero and any whitespace to get just the symbol
  return formatted.replace(/[\d\s.,]/g, "").trim();
}
