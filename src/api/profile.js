import { apiFetch } from "./client";

export function fetchProfileSettings() {
  return apiFetch("/profile/settings");
}

export function fetchProfileGameSummary() {
  return apiFetch("/profile/game");
}

export function updateProfileSettings(payload) {
  return apiFetch("/profile/settings", {
    method: "PUT",
    body: payload,
  });
}
