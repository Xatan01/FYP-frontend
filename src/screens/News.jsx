import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Newspaper, TrendingUp } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import { useAppTheme } from "../context/ThemeContext";
import { fetchMarketNews } from "../api/market";

export default function News() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [stale, setStale] = useState(false);
  const [newsDate, setNewsDate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchMarketNews(5);
      setItems(Array.isArray(res?.items) ? res.items : []);
      setStale(Boolean(res?.stale));
      setNewsDate(res?.news_date || null);
      setLastUpdated(res?.updated_at || null);
    } catch (err) {
      setItems([]);
      setError(err?.message || "Failed to load market news.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const handleOpen = useCallback(async (url) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Market News</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshButton} onPress={loadNews} disabled={loading}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
            <View style={styles.pill}>
              <TrendingUp size={14} color="#16a34a" />
              <Text style={styles.pillText}>{stale ? "Cached" : "Daily"}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.updatedText}>
          Last updated: {formatTimestamp(lastUpdated)}
          {newsDate ? ` | News date: ${newsDate}` : ""}
        </Text>
        {stale ? (
          <Text style={styles.staleText}>
            Showing the latest cached batch because today's sync has not run yet.
          </Text>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={styles.loadingText}>Refreshing news...</Text>
          </View>
        ) : !items.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No market news available.</Text>
            <Text style={styles.emptyStateText}>
              Run the backend sync once or wait for the daily scheduler.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <TouchableOpacity
              key={item.news_id || item.url}
              style={styles.card}
              onPress={() => handleOpen(item.url)}
            >
              <View style={styles.iconCircle}>
                <Newspaper size={18} color="#fff" />
              </View>
              <View style={styles.textBlock}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.headline}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {item.source || "Market News"} - {formatRelativeTime(item.published_at)}
                </Text>
                {item.summary ? (
                  <Text style={styles.summary} numberOfLines={3}>
                    {item.summary}
                  </Text>
                ) : null}
                <View style={styles.metaRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.category || "general"}</Text>
                  </View>
                  {Array.isArray(item.symbols) && item.symbols.length ? (
                    <Text style={styles.symbolsText} numberOfLines={1}>
                      {item.symbols.slice(0, 3).join(", ")}
                    </Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatRelativeTime(value) {
  if (!value) return "Unknown time";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatTimestamp(value) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return date.toLocaleString();
}

function buildStyles(palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    container: { flex: 1 },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: verticalScale(12),
    },
    headerActions: { flexDirection: "row", alignItems: "center", gap: scale(8) },
    header: {
      fontSize: moderateScale(22),
      fontWeight: "bold",
      color: palette.textPrimary,
    },
    refreshButton: {
      backgroundColor: palette.warningSoft,
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.cardBorder,
    },
    refreshText: { color: "#b45309", fontSize: moderateScale(11), fontWeight: "600" },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      backgroundColor: palette.successSoft,
      borderRadius: 999,
    },
    pillText: { color: palette.success, fontWeight: "600", fontSize: moderateScale(12) },
    updatedText: {
      alignSelf: "flex-start",
      fontSize: moderateScale(11),
      color: palette.textMuted,
      marginBottom: verticalScale(10),
    },
    staleText: {
      fontSize: moderateScale(11),
      color: palette.warning || "#b45309",
      marginBottom: verticalScale(8),
    },
    errorText: {
      fontSize: moderateScale(12),
      color: palette.danger || "#dc2626",
      marginBottom: verticalScale(10),
    },
    card: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: palette.cardSoft,
      borderRadius: 16,
      padding: scale(14),
      marginBottom: verticalScale(12),
      borderWidth: 1,
      borderColor: palette.cardBorder,
    },
    iconCircle: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: "#f59e0b",
      alignItems: "center",
      justifyContent: "center",
      marginRight: scale(12),
    },
    textBlock: { flex: 1 },
    title: { fontSize: moderateScale(14), fontWeight: "600", color: palette.textPrimary },
    meta: { fontSize: moderateScale(12), color: palette.textMuted, marginTop: 2 },
    summary: {
      fontSize: moderateScale(12),
      lineHeight: moderateScale(18),
      color: palette.textSecondary,
      marginTop: verticalScale(6),
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: verticalScale(8),
      gap: scale(8),
    },
    tag: {
      alignSelf: "flex-start",
      backgroundColor: palette.accentSoft,
      borderRadius: 999,
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(2),
      marginTop: verticalScale(6),
    },
    tagText: { color: palette.accent, fontSize: moderateScale(11), fontWeight: "600" },
    symbolsText: {
      flex: 1,
      textAlign: "right",
      fontSize: moderateScale(11),
      color: palette.textMuted,
    },
    loading: { alignItems: "center", gap: verticalScale(6), marginVertical: 12 },
    loadingText: { color: "#b45309", fontSize: moderateScale(12) },
    emptyState: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: scale(16),
      borderWidth: 1,
      borderColor: palette.cardBorder,
    },
    emptyStateTitle: {
      fontSize: moderateScale(14),
      fontWeight: "700",
      color: palette.textPrimary,
      marginBottom: verticalScale(6),
    },
    emptyStateText: {
      fontSize: moderateScale(12),
      lineHeight: moderateScale(18),
      color: palette.textMuted,
    },
  });
}
