import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Newspaper } from "lucide-react-native";
import { useAppTheme } from "../context/ThemeContext";

const news = [
  { title: "Singapore GDP beats forecasts", source: "Business Times", time: "2h ago" },
  { title: "REITs remain strong amid rates", source: "Straits Times", time: "5h ago" },
];

export default function NewsCard({ onPress }) {
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.header}>Latest Financial News</Text>
      {news.map((n) => (
        <View key={n.title} style={styles.newsRow}>
          <View style={styles.iconCircle}>
            <Newspaper size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={2}>
              {n.title}
            </Text>
            <Text style={styles.meta}>
              {n.source} - {n.time}
            </Text>
          </View>
        </View>
      ))}
    </Wrapper>
  );
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
  });
}
