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

export function formatDate(value?: string | Date | null, fmt = "MMM D, YYYY"): string {
  if (!value) return "—";
  return dayjs(value).format(fmt);
}

export function formatDateTime(value?: string | Date | null): string {
  return formatDate(value, "MMM D, YYYY h:mm A");
}
