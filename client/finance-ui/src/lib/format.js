import dayjs from "dayjs";

export function formatCurrency(amount, currency = "USD") {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "-";
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

export function formatDate(value, fmt = "MMM D, YYYY") {
  if (!value) return "-";
  return dayjs(value).format(fmt);
}

export function formatDateTime(value) {
  return formatDate(value, "MMM D, YYYY h:mm A");
}

export function classNames(...args) {
  return args.filter(Boolean).join(" ");
}
