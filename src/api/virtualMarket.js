import { apiFetch } from "./client";

export function bootstrapVirtualMarket() {
  return apiFetch("/virtual-market/bootstrap", { method: "POST" });
}

export function fetchVirtualMarketStocks() {
  return apiFetch("/virtual-market/stocks");
}

export function fetchVirtualMarketPortfolio() {
  return apiFetch("/virtual-market/portfolio");
}

export function fetchVirtualMarketOrders({ limit = 20, offset = 0 } = {}) {
  const query = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  return apiFetch(`/virtual-market/orders${query}`);
}

export function placeVirtualMarketOrder({
  side,
  symbol,
  quantity,
  clientOrderId,
}) {
  const normalizedSide = String(side || "").trim().toLowerCase();
  if (!["buy", "sell"].includes(normalizedSide)) {
    throw new Error("Order side must be buy or sell.");
  }

  return apiFetch(`/virtual-market/orders/${normalizedSide}`, {
    method: "POST",
    body: {
      symbol,
      quantity,
      client_order_id: clientOrderId || undefined,
    },
  });
}
