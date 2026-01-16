import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Activity } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

const sectors = [
  { name: "Banks", change: "+1.4%", tone: "#16a34a" },
  { name: "REITs", change: "+0.8%", tone: "#22c55e" },
  { name: "Tech", change: "-0.6%", tone: "#ef4444" },
  { name: "Energy", change: "+0.2%", tone: "#84cc16" },
  { name: "Utilities", change: "-1.1%", tone: "#dc2626" },
  { name: "Industrials", change: "+0.5%", tone: "#10b981" },
];

const signals = [
  { label: "Momentum", value: "Strong" },
  { label: "Volatility", value: "Moderate" },
  { label: "Sentiment", value: "Positive" },
];

export default function MarketTrends() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Personalized Market Trends</Text>
          <View style={styles.pill}>
            <Activity size={14} color="#2563eb" />
            <Text style={styles.pillText}>Daily</Text>
          </View>
        </View>

        <View style={styles.signalCard}>
          {signals.map((item) => (
            <View key={item.label} style={styles.signalItem}>
              <Text style={styles.signalLabel}>{item.label}</Text>
              <Text style={styles.signalValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeader}>Sector Heatmap</Text>
        <View style={styles.grid}>
          {sectors.map((sector) => (
            <View key={sector.name} style={styles.tile}>
              <View style={[styles.colorChip, { backgroundColor: sector.tone }]} />
              <Text style={styles.tileName}>{sector.name}</Text>
              <Text style={styles.tileChange}>{sector.change}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  header: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#0f172a",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    backgroundColor: "#eff6ff",
    borderRadius: 999,
  },
  pillText: { color: "#2563eb", fontSize: moderateScale(12), fontWeight: "600" },
  signalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(14),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: verticalScale(16),
  },
  signalItem: { alignItems: "center", flex: 1 },
  signalLabel: { fontSize: moderateScale(12), color: "#64748b" },
  signalValue: { fontSize: moderateScale(14), fontWeight: "700", color: "#0f172a" },
  sectionHeader: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: verticalScale(10),
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(10),
  },
  tile: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(14),
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  colorChip: {
    width: scale(12),
    height: scale(12),
    borderRadius: 6,
    marginBottom: verticalScale(8),
  },
  tileName: { fontSize: moderateScale(14), fontWeight: "600", color: "#0f172a" },
  tileChange: { fontSize: moderateScale(12), color: "#64748b", marginTop: 2 },
});
