import { apiFetch } from "./client";

export function fetchJournalEntries({ limit = 50, offset = 0 } = {}) {
  const query = `?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  return apiFetch(`/trading-journal/entries${query}`);
}

export function createJournalEntry(payload) {
  return apiFetch("/trading-journal/entries", {
    method: "POST",
    body: payload,
  });
}

export function updateJournalEntry(entryId, payload) {
  return apiFetch(`/trading-journal/entries/${encodeURIComponent(entryId)}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteJournalEntry(entryId) {
  return apiFetch(`/trading-journal/entries/${encodeURIComponent(entryId)}`, {
    method: "DELETE",
  });
}
