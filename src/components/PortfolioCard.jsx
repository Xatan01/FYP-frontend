import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendingUp } from "lucide-react-native";
import { useAppTheme } from "../context/ThemeContext";

export default function PortfolioCard({
  value = "$125,430.50",
  percentage = 12.5,
}) {
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const isPositive = percentage >= 0;
  const trendColor = isPositive ? "#16a34a" : "#dc2626";

  return (
    <View style={styles.card}>
      <Text style={styles.subtitle}>Portfolio Value</Text>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.value}>{value}</Text>
          <View style={styles.row}>
            <TrendingUp size={14} color={trendColor} />
            <Text style={[styles.change, { color: trendColor }]}>
              {isPositive ? "+" : ""}
              {percentage}%
            </Text>
            <Text style={styles.period}>this month</Text>
          </View>
        </View>
        <View style={styles.iconCircle}>
          <TrendingUp size={20} color="#fff" />
        </View>
      </View>
    </View>
  );
}

function buildStyles(palette) {
  return StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    padding: 16,
    borderRadius: 16,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  subtitle: { fontSize: 12, color: palette.textMuted, marginBottom: 4 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  value: { fontSize: 24, fontWeight: "bold", color: palette.textPrimary },
  row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  change: { fontSize: 12, fontWeight: "600", marginLeft: 4 },
  period: { fontSize: 12, color: palette.textMuted, marginLeft: 6 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  });
}
