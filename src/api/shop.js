import { apiFetch } from "./client";

export function fetchStockShopCatalog() {
  return apiFetch("/shop/catalog");
}

export function purchaseStockUnlock({
  symbol,
  paymentProvider,
  providerTransactionId,
  amount,
  currency = "USD",
  paymentStatus = "completed",
}) {
  return apiFetch("/shop/purchase", {
    method: "POST",
    body: {
      symbol,
      payment_provider: paymentProvider,
      provider_transaction_id: providerTransactionId,
      amount,
      currency,
      payment_status: paymentStatus,
    },
  });
}
