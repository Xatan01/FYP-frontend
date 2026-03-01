import { supabase } from "../lib/supabase";

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function fetchWatchlist() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("user_watchlist")
    .select("id, symbol, display_name, is_favorite, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addWatchlistItem(symbol, displayName = "") {
  const userId = await getCurrentUserId();
  const cleanSymbol = symbol.trim().toUpperCase();
  const cleanName = String(displayName || "").trim();

  const { data, error } = await supabase
    .from("user_watchlist")
    .insert({
      user_id: userId,
      symbol: cleanSymbol,
      display_name: cleanName || null,
    })
    .select("id, symbol, display_name, is_favorite, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function removeWatchlistItem(id) {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("user_watchlist")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function updateWatchlistFavorite(id, isFavorite) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("user_watchlist")
    .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, symbol, display_name, is_favorite, created_at")
    .single();

  if (error) throw error;
  return data;
}
