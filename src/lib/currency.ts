// Currency helpers used everywhere prices are shown.

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  BDT: "৳",
  INR: "₹",
  CAD: "CA$",
  AUD: "AU$",
  JPY: "¥",
  CNY: "¥",
};

/** The symbol for an ISO code, "$" when unknown. */
export function getCurrencySymbol(currency?: string): string {
  if (!currency) return "$";
  const upper = currency.toUpperCase().trim();
  return CURRENCY_SYMBOLS[upper] || upper;
}

/** Formats an amount with a symbol, e.g. formatAmount(1200, "৳") => "৳1,200.00". */
export function formatAmount(
  amount: number | string | undefined | null,
  symbol: string,
  opts?: { showDecimals?: boolean }
): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0;
  const decimals = opts?.showDecimals === false ? 0 : 2;
  return `${symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** Formats an amount for a currency code, e.g. formatPrice(1200, "BDT") => "৳1,200.00". */
export function formatPrice(
  amount: number | string | undefined | null,
  currency: string = "USD",
  opts?: { showDecimals?: boolean }
): string {
  return formatAmount(amount, getCurrencySymbol(currency), opts);
}
