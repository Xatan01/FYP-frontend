import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Newspaper } from "lucide-react-native";
import { useAppTheme } from "../context/ThemeContext";
import { fetchMarketNews } from "../api/market";

export default function NewsCard({ onPress }) {
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const Wrapper = onPress ? TouchableOpacity : View;

  useEffect(() => {
    let active = true;

    async function loadNews() {
      try {
        const res = await fetchMarketNews(2);
        if (!active) return;
        setItems(Array.isArray(res?.items) ? res.items : []);
      } catch {
        if (!active) return;
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadNews();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Wrapper style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.header}>Latest Financial News</Text>
      {loading ? (
        <View style={styles.stateRow}>
          <ActivityIndicator size="small" color="#f59e0b" />
          <Text style={styles.stateText}>Loading latest headlines...</Text>
        </View>
      ) : items.length ? (
        items.map((item) => (
          <View key={item.news_id || item.url} style={styles.newsRow}>
            <View style={styles.iconCircle}>
              <Newspaper size={16} color="#fff" />
            </View>
            <View style={styles.contentWrap}>
              <Text style={styles.title} numberOfLines={2}>
                {item.headline}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {item.source || "Market News"} - {formatRelativeTime(item.published_at)}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.stateRow}>
          <Text style={styles.stateText}>No cached market news yet.</Text>
        </View>
      )}
    </Wrapper>
  );
}

function formatRelativeTime(value) {
  if (!value) return "Unknown time";

  const published = new Date(value);
  if (Number.isNaN(published.getTime())) return "Unknown time";

  const diffMs = Date.now() - published.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function buildStyles(palette) {
  return StyleSheet.create({
    card: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: palette.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
      borderWidth: 1,
      borderColor: palette.cardBorder,
    },
    header: { fontSize: 12, color: palette.textMuted, marginBottom: 12 },
    newsRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    contentWrap: { flex: 1 },
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#f59e0b",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    title: { fontSize: 14, fontWeight: "600", color: palette.textPrimary },
    meta: { fontSize: 12, color: palette.textMuted, marginTop: 2 },
    stateRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    stateText: { fontSize: 12, color: palette.textMuted },
  });
}
