const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(value, currency = "$") {
  if (!Number.isFinite(Number(value))) return `${currency}--`;
  return `${currency}${numberFormatter.format(Number(value))}`;
}

export function formatQuantity(value) {
  if (!Number.isFinite(Number(value))) return "--";
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

export function formatDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function parsePositiveQuantity(rawValue) {
  const normalized = String(rawValue || "")
    .trim()
    .replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}
