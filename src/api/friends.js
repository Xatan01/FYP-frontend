import { apiFetch } from "./client";

export function fetchMyFriendProfile() {
  return apiFetch("/friends/profile/me");
}

export function updateMyFriendProfile(username) {
  return apiFetch("/friends/profile/me", {
    method: "PUT",
    body: { username },
  });
}

export function searchFriendProfiles(query, limit = 10) {
  const q = `?query=${encodeURIComponent(query)}&limit=${encodeURIComponent(limit)}`;
  return apiFetch(`/friends/search${q}`);
}

export function sendFriendRequest(username) {
  return apiFetch("/friends/requests", {
    method: "POST",
    body: { username },
  });
}

export function fetchIncomingFriendRequests() {
  return apiFetch("/friends/requests/incoming");
}

export function fetchOutgoingFriendRequests() {
  return apiFetch("/friends/requests/outgoing");
}

export function acceptFriendRequest(friendshipId) {
  return apiFetch(`/friends/requests/${encodeURIComponent(friendshipId)}/accept`, {
    method: "POST",
  });
}

export function declineFriendRequest(friendshipId) {
  return apiFetch(`/friends/requests/${encodeURIComponent(friendshipId)}/decline`, {
    method: "POST",
  });
}

export function fetchFriendsList() {
  return apiFetch("/friends");
}

export function removeFriend(friendUserId) {
  return apiFetch(`/friends/${encodeURIComponent(friendUserId)}`, {
    method: "DELETE",
  });
}
