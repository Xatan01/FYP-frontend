import { apiFetch } from "./client";

export function fetchAITraderSignals(symbol, lookbackDays = 300) {
  const query = `?symbol=${encodeURIComponent(symbol)}&lookback_days=${encodeURIComponent(lookbackDays)}`;
  return apiFetch(`/ai-trader/signals${query}`);
}
