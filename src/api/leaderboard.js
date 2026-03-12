import { apiFetch } from "./client";

export function fetchLeaderboards() {
  return apiFetch("/leaderboard");
}
