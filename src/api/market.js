import { apiFetch } from "./client";

export function fetchMarketChart(symbol, range = "1M") {
  const query = `?symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(range)}`;
  return apiFetch(`/market/chart${query}`);
}

export function searchMarketSymbols(query, limit = 8) {
  const q = `?query=${encodeURIComponent(query)}&limit=${encodeURIComponent(limit)}`;
  return apiFetch(`/market/search${q}`);
}

export function fetchPopularMarketQuotes() {
  return apiFetch("/market/popular");
}

export function fetchMarketQuotes(symbols) {
  const list = Array.isArray(symbols) ? symbols : [];
  if (!list.length) return Promise.resolve({ items: [] });
  const csv = list.map((s) => String(s).trim().toUpperCase()).filter(Boolean).join(",");
  return apiFetch(`/market/quotes?symbols=${encodeURIComponent(csv)}`);
}

export function fetchMarketNews(limit = 5) {
  const query = `?limit=${encodeURIComponent(limit)}`;
  return apiFetch(`/market/news${query}`);
}
