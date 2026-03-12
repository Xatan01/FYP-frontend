import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Animated,
} from "react-native";
import { Heart } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import { addWatchlistItem, fetchWatchlist, removeWatchlistItem } from "../api/watchlist";
import { fetchMarketQuotes, fetchPopularMarketQuotes, searchMarketSymbols } from "../api/market";

function getLogoUrl(symbol) {
  return `https://financialmodelingprep.com/image-stock/${encodeURIComponent(symbol)}.png`;
}

function SymbolRow({
  symbol,
  name,
  quote,
  logo,
  liked,
  pending,
  onPressChart,
  onToggleHeart,
  tone = "default",
}) {
  const heartScale = useRef(new Animated.Value(1)).current;

  const animateHeart = () => {
    heartScale.setValue(0.8);
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.2,
        useNativeDriver: true,
        friction: 4,
        tension: 130,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 110,
      }),
    ]).start();
  };

  const handleHeartPress = () => {
    animateHeart();
    onToggleHeart();
  };

  return (
    <View style={[styles.rowCard, tone === "saved" ? styles.rowCardSaved : styles.rowCardPopular]}>
      <TouchableOpacity style={styles.rowLeft} onPress={onPressChart}>
        {logo}
        <View style={{ flex: 1 }}>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {name || symbol}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.right}>
        <Text style={styles.price}>{quote.price}</Text>
        <Text style={[styles.change, { color: quote.changeColor }]}>{quote.change}</Text>
        <TouchableOpacity
          style={[styles.heartBtn, pending && styles.heartBtnDisabled]}
          onPress={handleHeartPress}
          disabled={pending}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Heart
              size={18}
              color={liked ? "#fb7185" : "#94a3b8"}
              fill={liked ? "#fb7185" : "none"}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Watchlist({ navigation }) {
  const [watchlist, setWatchlist] = useState([]);
  const [popular, setPopular] = useState([]);
  const [quotesBySymbol, setQuotesBySymbol] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [symbolQuery, setSymbolQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [refreshingQuotes, setRefreshingQuotes] = useState(false);
  const [pendingSymbols, setPendingSymbols] = useState({});
  const [logoFailed, setLogoFailed] = useState({});
  const searchRequestSeq = useRef(0);

  const watchlistBySymbol = useMemo(() => {
    const map = new Map();
    watchlist.forEach((item) => {
      const key = String(item.symbol || "").toUpperCase();
      if (key) map.set(key, item);
    });
    return map;
  }, [watchlist]);

  const watchlistSymbols = useMemo(() => Array.from(watchlistBySymbol.keys()), [watchlistBySymbol]);

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
        symbol: String(item.symbol || "").toUpperCase(),
        name: item.display_name || item.symbol,
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
    const query = String(symbolQuery || "").trim();
    const requestId = searchRequestSeq.current + 1;
    searchRequestSeq.current = requestId;
    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await searchMarketSymbols(query, 8);
        const rawResults = Array.isArray(res?.results) ? res.results : [];
        const dedupedBySymbol = [];
        const seen = new Set();
        rawResults.forEach((item) => {
          const symbol = String(item?.symbol || "").trim().toUpperCase();
          if (!symbol || seen.has(symbol)) return;
          seen.add(symbol);
          dedupedBySymbol.push({
            ...item,
            symbol,
          });
        });
        if (requestId === searchRequestSeq.current) {
          setSearchResults(dedupedBySymbol);
        }
      } catch {
        if (requestId === searchRequestSeq.current) {
          setSearchResults([]);
        }
      } finally {
        if (requestId === searchRequestSeq.current) {
          setSearchLoading(false);
        }
      }
    }, 280);

    return () => {
      clearTimeout(timer);
    };
  }, [symbolQuery]);

  const toggleWatchlist = async (symbol, displayName = "") => {
    const cleanSymbol = String(symbol || "").trim().toUpperCase();
    if (!cleanSymbol || pendingSymbols[cleanSymbol]) return false;

    setPendingSymbols((prev) => ({ ...prev, [cleanSymbol]: true }));
    setError("");
    try {
      const existing = watchlistBySymbol.get(cleanSymbol);
      if (existing) {
        await removeWatchlistItem(existing.id);
        setWatchlist((prev) => prev.filter((item) => item.id !== existing.id));
      } else {
        const created = await addWatchlistItem(cleanSymbol, displayName || cleanSymbol);
        const nextItem = {
          id: created.id,
          symbol: String(created.symbol || "").toUpperCase(),
          name: created.display_name || created.symbol,
        };
        setWatchlist((prev) => [nextItem, ...prev]);
        const quoteRes = await fetchMarketQuotes([nextItem.symbol]);
        mergeQuotes(quoteRes?.items || []);
      }
      return true;
    } catch (err) {
      setError(err?.message || "Failed to update watchlist.");
      return false;
    } finally {
      setPendingSymbols((prev) => {
        const next = { ...prev };
        delete next[cleanSymbol];
        return next;
      });
    }
  };

  const handleSearchHeartToggle = async (symbol, displayName = "") => {
    const updated = await toggleWatchlist(symbol, displayName);
    if (updated) {
      setSymbolQuery("");
      setSearchResults([]);
    }
  };

  const renderQuote = (symbol) => {
    const symbolKey = String(symbol || "").toUpperCase();
    const item = quotesBySymbol[symbolKey];
    const price = Number.isFinite(item?.price) ? `$${Number(item.price).toFixed(2)}` : "$--";
    const change = Number.isFinite(item?.change_percent)
      ? `${item.change_percent >= 0 ? "+" : ""}${Number(item.change_percent).toFixed(2)}%`
      : "--";
    const changeColor = change.startsWith("-") ? "#dc2626" : "#16a34a";
    return { price, change, changeColor };
  };

  const renderLogo = (symbol) => {
    const symbolKey = String(symbol || "").toUpperCase();
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

          <View style={styles.searchCard}>
            <Text style={styles.searchTitle}>Search Symbols</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search symbol (e.g. AAPL)"
              placeholderTextColor="#94a3b8"
              value={symbolQuery}
              onChangeText={setSymbolQuery}
              autoCapitalize="characters"
            />
            {searchLoading ? <Text style={styles.searchHint}>Searching...</Text> : null}
            {!searchLoading && symbolQuery.trim().length >= 2 && !searchResults.length ? (
              <Text style={styles.searchHint}>No matching symbols found.</Text>
            ) : null}
            {searchResults.slice(0, 6).map((item) => {
              const symbolKey = String(item.symbol || "").toUpperCase();
              return (
                <SymbolRow
                  key={`${symbolKey}-search`}
                  symbol={symbolKey}
                  name={item.name || symbolKey}
                  quote={renderQuote(symbolKey)}
                  logo={renderLogo(symbolKey)}
                  liked={watchlistBySymbol.has(symbolKey)}
                  pending={Boolean(pendingSymbols[symbolKey])}
                  onPressChart={() => navigation.navigate("Charting", { symbol: symbolKey })}
                  onToggleHeart={() => handleSearchHeartToggle(symbolKey, item.name || symbolKey)}
                />
              );
            })}
          </View>

          <Text style={styles.sectionHeader}>Popular</Text>
          {popular.map((item) => {
            const symbolKey = String(item.symbol || "").toUpperCase();
            return (
              <SymbolRow
                key={`${symbolKey}-popular`}
                symbol={symbolKey}
                name={item.name || symbolKey}
                quote={renderQuote(symbolKey)}
                logo={renderLogo(symbolKey)}
                liked={watchlistBySymbol.has(symbolKey)}
                pending={Boolean(pendingSymbols[symbolKey])}
                onPressChart={() => navigation.navigate("Charting", { symbol: symbolKey })}
                onToggleHeart={() => toggleWatchlist(symbolKey, item.name || symbolKey)}
              />
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

          {watchlist.map((item) => (
            <SymbolRow
              key={`${item.id}-saved`}
              symbol={item.symbol}
              name={item.name || item.symbol}
              quote={renderQuote(item.symbol)}
              logo={renderLogo(item.symbol)}
              liked={true}
              pending={Boolean(pendingSymbols[item.symbol])}
              onPressChart={() => navigation.navigate("Charting", { symbol: item.symbol })}
              onToggleHeart={() => toggleWatchlist(item.symbol, item.name || item.symbol)}
              tone="saved"
            />
          ))}

          {!watchlist.length && (
            <Text style={styles.emptyState}>Heart a symbol in Popular to add it here.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  container: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
  },
  loadingText: { color: "#94a3b8", fontSize: moderateScale(12) },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: verticalScale(12),
  },
  error: {
    color: "#fca5a5",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  searchCard: {
    backgroundColor: "#0f172a",
    borderRadius: scale(16),
    padding: scale(12),
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: verticalScale(12),
  },
  searchTitle: {
    color: "#e2e8f0",
    fontSize: moderateScale(13),
    fontWeight: "700",
    marginBottom: verticalScale(8),
  },
  searchInput: {
    backgroundColor: "#111827",
    borderRadius: scale(12),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(10),
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: verticalScale(8),
    fontSize: moderateScale(12),
    color: "#f8fafc",
  },
  searchHint: {
    color: "#94a3b8",
    fontSize: moderateScale(11),
    marginBottom: verticalScale(8),
  },
  sectionHeader: {
    fontSize: moderateScale(14),
    color: "#e2e8f0",
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
    backgroundColor: "#1e293b",
    borderRadius: 8,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
  },
  refreshQuotesText: {
    color: "#93c5fd",
    fontSize: moderateScale(11),
    fontWeight: "700",
  },
  rowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: scale(12),
    marginBottom: verticalScale(8),
  },
  rowCardPopular: {
    backgroundColor: "#0f172a",
  },
  rowCardSaved: {
    backgroundColor: "#111827",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    flex: 1,
    marginRight: scale(10),
  },
  logo: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: "#334155",
  },
  logoFallback: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: "#1e3a8a",
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: {
    color: "#bfdbfe",
    fontSize: moderateScale(10),
    fontWeight: "700",
  },
  symbol: { fontSize: moderateScale(15), fontWeight: "600", color: "#f8fafc" },
  name: { fontSize: moderateScale(12), color: "#94a3b8", marginTop: 2 },
  right: { alignItems: "flex-end" },
  price: { fontSize: moderateScale(14), fontWeight: "600", color: "#f8fafc" },
  change: { fontSize: moderateScale(12), fontWeight: "500", marginTop: verticalScale(1) },
  heartBtn: {
    marginTop: verticalScale(6),
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#334155",
  },
  heartBtnDisabled: {
    opacity: 0.5,
  },
  emptyState: {
    textAlign: "center",
    color: "#64748b",
    fontSize: moderateScale(12),
    marginTop: verticalScale(12),
  },
});
