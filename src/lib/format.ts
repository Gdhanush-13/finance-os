import dayjs from "dayjs";

export function formatCurrency(
  amount: number | null | undefined,
  currency = "USD"
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}

export function formatCurrencyBreakdown(
  values: Array<{ currency: string; amount: number }> | null | undefined,
  fallbackAmount = 0,
  fallbackCurrency = "USD"
): string {
  if (!values?.length) return formatCurrency(fallbackAmount, fallbackCurrency);
  return values
    .filter((value) => Number.isFinite(value.amount))
    .map((value) => formatCurrency(value.amount, value.currency))
    .join(" · ");
}

export function formatDate(value?: string | Date | null, fmt = "MMM D, YYYY"): string {
  if (!value) return "—";
  return dayjs(value).format(fmt);
}

export function formatDateTime(value?: string | Date | null): string {
  return formatDate(value, "MMM D, YYYY h:mm A");
}
