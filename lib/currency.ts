export function formatWorkspaceCurrency(value: number | string | null | undefined, currency = "GBP", country = "GB") {
  return new Intl.NumberFormat(country === "IE" ? "en-IE" : "en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function workspaceLocale(country = "GB") {
  return country === "IE" ? "en-IE" : "en-GB";
}
