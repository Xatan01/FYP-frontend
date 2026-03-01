import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Image,
} from "react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import {
  addWatchlistItem,
  fetchWatchlist,
  removeWatchlistItem,
  updateWatchlistFavorite,
} from "../api/watchlist";
import {
  fetchMarketQuotes,
  fetchPopularMarketQuotes,
  searchMarketSymbols,
} from "../api/market";

function getLogoUrl(symbol) {
  return `https://financialmodelingprep.com/image-stock/${encodeURIComponent(symbol)}.png`;
}

export default function Watchlist({ navigation }) {
  const [watchlist, setWatchlist] = useState([]);
  const [popular, setPopular] = useState([]);
  const [quotesBySymbol, setQuotesBySymbol] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [symbol, setSymbol] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [refreshingQuotes, setRefreshingQuotes] = useState(false);
  const [logoFailed, setLogoFailed] = useState({});

  const watchlistSymbols = useMemo(
    () => watchlist.map((item) => item.symbol),
    [watchlist]
  );
  const watchlistSymbolSet = useMemo(() => new Set(watchlistSymbols), [watchlistSymbols]);

  const mergeQuotes = (items) => {
    const next = {};
    (items || []).forEach((item) => {
      const symbolKey = String(item?.symbol || "").toUpperCase();
      if (!symbolKey) return;
      next[symbolKey] = item;
    });
    setQuotesBySymbol((prev) => ({ ...prev, ...next }));
  };

  const refreshWatchlistQuotes = async (symbolsOverride) => {
    const targets = Array.isArray(symbolsOverride) ? symbolsOverride : watchlistSymbols;
    if (!targets.length) return;
    setRefreshingQuotes(true);
    try {
      const res = await fetchMarketQuotes(targets);
      mergeQuotes(res?.items || []);
    } catch {}
    setRefreshingQuotes(false);
  };

  const loadWatchlistAndPopular = async () => {
    setLoading(true);
    setError("");
    try {
      const [watchlistRows, popularRes] = await Promise.all([
        fetchWatchlist(),
        fetchPopularMarketQuotes(),
      ]);

      const saved = (watchlistRows || []).map((item) => ({
        id: item.id,
        symbol: item.symbol,
        name: item.display_name || item.symbol,
        favorite: Boolean(item.is_favorite),
      }));
      setWatchlist(saved);

      const popularItems = Array.isArray(popularRes?.items) ? popularRes.items : [];
      setPopular(popularItems);
      mergeQuotes(popularItems);

      if (saved.length) {
        const quoteRes = await fetchMarketQuotes(saved.map((item) => item.symbol));
        mergeQuotes(quoteRes?.items || []);
      }
    } catch (err) {
      setError(err?.message || "Failed to load watchlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlistAndPopular();
  }, []);

  useEffect(() => {
    const query = symbol.trim();
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await searchMarketSymbols(query, 8);
        setSearchResults(Array.isArray(res?.results) ? res.results : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [symbol]);

  const handleAdd = async (inputSymbol, inputName = "") => {
    const cleanSymbol = String(inputSymbol || "").trim().toUpperCase();
    if (!cleanSymbol || submitting || watchlistSymbolSet.has(cleanSymbol)) return;

    setSubmitting(true);
    setError("");
    try {
      const created = await addWatchlistItem(cleanSymbol, inputName);
      const nextItem = {
        id: created.id,
        symbol: created.symbol,
        name: created.display_name || created.symbol,
        favorite: Boolean(created.is_favorite),
      };
      setWatchlist((prev) => [nextItem, ...prev]);
      const quoteRes = await fetchMarketQuotes([nextItem.symbol]);
      mergeQuotes(quoteRes?.items || []);
    } catch (err) {
      setError(err?.message || "Failed to add symbol.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualAdd = async () => {
    await handleAdd(symbol, symbol);
    setSymbol("");
    setSearchResults([]);
  };

  const handleRemove = async (id) => {
    setError("");
    try {
      const removed = watchlist.find((item) => item.id === id);
      await removeWatchlistItem(id);
      setWatchlist((prev) => prev.filter((item) => item.id !== id));
      if (removed?.symbol) {
        setQuotesBySymbol((prev) => {
          const next = { ...prev };
          delete next[removed.symbol];
          return next;
        });
      }
    } catch (err) {
      setError(err?.message || "Failed to remove symbol.");
    }
  };

  const toggleFavorite = async (id) => {
    const current = watchlist.find((item) => item.id === id);
    if (!current) return;
    const next = !current.favorite;

    setWatchlist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, favorite: next } : item))
    );
    try {
      await updateWatchlistFavorite(id, next);
    } catch (err) {
      setWatchlist((prev) =>
        prev.map((item) => (item.id === id ? { ...item, favorite: !next } : item))
      );
      setError(err?.message || "Failed to update favorite.");
    }
  };

  const renderQuote = (symbolKey) => {
    const item = quotesBySymbol[symbolKey];
    const price = Number.isFinite(item?.price) ? `$${Number(item.price).toFixed(2)}` : "$--";
    const change = Number.isFinite(item?.change_percent)
      ? `${item.change_percent >= 0 ? "+" : ""}${Number(item.change_percent).toFixed(2)}%`
      : "--";
    const changeColor = change.startsWith("-") ? "#dc2626" : "#16a34a";
    return { price, change, changeColor };
  };

  const renderLogo = (symbolKey) => {
    if (logoFailed[symbolKey]) {
      return (
        <View style={styles.logoFallback}>
          <Text style={styles.logoFallbackText}>{symbolKey.slice(0, 2)}</Text>
        </View>
      );
    }
    return (
      <Image
        source={{ uri: getLogoUrl(symbolKey) }}
        style={styles.logo}
        onError={() =>
          setLogoFailed((prev) => ({
            ...prev,
            [symbolKey]: true,
          }))
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading watchlist...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ padding: scale(16) }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Your Watchlist</Text>
          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.addCard}>
            <TextInput
              style={styles.addInput}
              placeholder="Search symbol (e.g. AAPL)"
              placeholderTextColor="#94a3b8"
              value={symbol}
              onChangeText={setSymbol}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleManualAdd}>
              <Text style={styles.addButtonText}>{submitting ? "Adding..." : "Add Symbol"}</Text>
            </TouchableOpacity>
            {searchLoading ? <Text style={styles.searchHint}>Searching...</Text> : null}
            {searchResults.slice(0, 6).map((item) => {
              const added = watchlistSymbolSet.has(item.symbol);
              return (
                <TouchableOpacity
                  key={`${item.symbol}-${item.exchange || "EX"}`}
                  style={styles.searchItem}
                  disabled={added || submitting}
                  onPress={async () => {
                    await handleAdd(item.symbol, item.name || item.symbol);
                    setSymbol("");
                    setSearchResults([]);
                  }}
                >
                  <View style={styles.searchRowLeft}>
                    {renderLogo(item.symbol)}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.searchSymbol}>{item.symbol}</Text>
                      <Text style={styles.searchName} numberOfLines={1}>
                        {item.name || item.symbol}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.searchAction}>{added ? "Added" : "Add"}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionHeader}>Popular</Text>
          {popular.map((item) => {
            const added = watchlistSymbolSet.has(item.symbol);
            const q = renderQuote(item.symbol);
            return (
              <View key={item.symbol} style={styles.popularCard}>
                <View style={styles.rowLeft}>
                  {renderLogo(item.symbol)}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.symbol}>{item.symbol}</Text>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name || item.symbol}
                    </Text>
                  </View>
                </View>
                <View style={styles.right}>
                  <Text style={styles.price}>{q.price}</Text>
                  <Text style={[styles.change, { color: q.changeColor }]}>{q.change}</Text>
                  <TouchableOpacity
                    style={[styles.quickAddBtn, added && styles.quickAddBtnDisabled]}
                    disabled={added || submitting}
                    onPress={() => handleAdd(item.symbol, item.name || item.symbol)}
                  >
                    <Text style={styles.quickAddText}>{added ? "Added" : "Add"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <View style={styles.savedHeaderRow}>
            <Text style={styles.sectionHeader}>Saved Watchlist</Text>
            <TouchableOpacity
              style={styles.refreshQuotesBtn}
              onPress={() => refreshWatchlistQuotes()}
              disabled={refreshingQuotes}
            >
              <Text style={styles.refreshQuotesText}>
                {refreshingQuotes ? "Refreshing..." : "Refresh"}
              </Text>
            </TouchableOpacity>
          </View>

          {watchlist.map((s) => {
            const q = renderQuote(s.symbol);
            return (
              <TouchableOpacity
                key={s.id}
                style={styles.card}
                onPress={() => navigation.navigate("Charting", { symbol: s.symbol })}
              >
                <View style={styles.rowLeft}>
                  {renderLogo(s.symbol)}
                  <View>
                    <Text style={styles.symbol}>{s.symbol}</Text>
                    <Text style={styles.name}>{s.name}</Text>
                  </View>
                </View>
                <View style={styles.right}>
                  <Text style={styles.price}>{q.price}</Text>
                  <Text style={[styles.change, { color: q.changeColor }]}>{q.change}</Text>
                  <View style={styles.alertRow}>
                    <Text style={styles.alertLabel}>Favorite</Text>
                    <Switch value={s.favorite} onValueChange={() => toggleFavorite(s.id)} />
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(s.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}

          {watchlist.length === 0 && (
            <Text style={styles.emptyState}>No symbols saved yet. Use search above.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
  },
  loadingText: { color: "#64748b", fontSize: moderateScale(12) },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: verticalScale(12),
  },
  error: {
    color: "#dc2626",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  addCard: {
    backgroundColor: "#f8fafc",
    borderRadius: scale(16),
    padding: scale(12),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: verticalScale(12),
  },
  addInput: {
    backgroundColor: "#fff",
    borderRadius: scale(12),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(10),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: verticalScale(8),
    fontSize: moderateScale(12),
    color: "#0f172a",
  },
  addButton: {
    backgroundColor: "#2563eb",
    borderRadius: scale(12),
    paddingVertical: verticalScale(10),
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
  searchHint: {
    color: "#64748b",
    fontSize: moderateScale(11),
    marginTop: verticalScale(6),
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  searchSymbol: { fontSize: moderateScale(13), fontWeight: "700", color: "#0f172a" },
  searchName: { fontSize: moderateScale(11), color: "#64748b", marginTop: 2 },
  searchAction: { color: "#2563eb", fontSize: moderateScale(12), fontWeight: "700" },
  sectionHeader: {
    fontSize: moderateScale(14),
    color: "#0f172a",
    fontWeight: "700",
    marginBottom: verticalScale(8),
    marginTop: verticalScale(4),
  },
  savedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refreshQuotesBtn: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
  },
  refreshQuotesText: {
    color: "#2563eb",
    fontSize: moderateScale(11),
    fontWeight: "700",
  },
  popularCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: scale(12),
    marginBottom: verticalScale(8),
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    flex: 1,
  },
  logo: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: "#e2e8f0",
  },
  logoFallback: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: {
    color: "#1d4ed8",
    fontSize: moderateScale(10),
    fontWeight: "700",
  },
  symbol: { fontSize: moderateScale(15), fontWeight: "600", color: "#0f172a" },
  name: { fontSize: moderateScale(12), color: "#475569", marginTop: 2 },
  right: { alignItems: "flex-end" },
  price: { fontSize: moderateScale(14), fontWeight: "600", color: "#0f172a" },
  change: { fontSize: moderateScale(12), fontWeight: "500" },
  quickAddBtn: {
    marginTop: verticalScale(6),
    backgroundColor: "#dbeafe",
    borderRadius: scale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
  },
  quickAddBtnDisabled: {
    backgroundColor: "#e2e8f0",
  },
  quickAddText: {
    color: "#1d4ed8",
    fontSize: moderateScale(11),
    fontWeight: "700",
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginTop: verticalScale(6),
  },
  alertLabel: { fontSize: moderateScale(11), color: "#64748b" },
  removeButton: {
    marginTop: verticalScale(6),
    backgroundColor: "#fee2e2",
    borderRadius: scale(8),
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(8),
  },
  removeText: { color: "#dc2626", fontSize: moderateScale(11), fontWeight: "600" },
  emptyState: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: moderateScale(12),
    marginTop: verticalScale(12),
  },
});
