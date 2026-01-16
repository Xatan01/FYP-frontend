import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { PieChart, TrendingUp } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

const holdings = [
  { symbol: "DBS", name: "DBS Bank", value: "$12,400", weight: "28%" },
  { symbol: "AAPL", name: "Apple", value: "$9,800", weight: "22%" },
  { symbol: "CIT", name: "CapitaLand REIT", value: "$7,200", weight: "16%" },
  { symbol: "TSLA", name: "Tesla", value: "$6,500", weight: "14%" },
];

const allocation = [
  { label: "Equities", value: "52%", tone: "#2563eb" },
  { label: "REITs", value: "24%", tone: "#16a34a" },
  { label: "ETFs", value: "14%", tone: "#f59e0b" },
  { label: "Cash", value: "10%", tone: "#94a3b8" },
];

export default function Portfolio() {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLastUpdated("Just now");
      setLoading(false);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Portfolio Tracker</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
            <View style={styles.badge}>
              <TrendingUp size={14} color="#16a34a" />
              <Text style={styles.badgeText}>+2.4% today</Text>
            </View>
          </View>
        </View>
        <Text style={styles.updatedText}>Last updated: {lastUpdated}</Text>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Refreshing portfolio...</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <PieChart size={18} color="#2563eb" />
                <Text style={styles.cardTitle}>Asset Allocation</Text>
              </View>
              {allocation.map((item) => (
                <View key={item.label} style={styles.allocationRow}>
                  <View style={[styles.dot, { backgroundColor: item.tone }]} />
                  <Text style={styles.allocationLabel}>{item.label}</Text>
                  <Text style={styles.allocationValue}>{item.value}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionHeader}>Holdings</Text>
            {holdings.map((h) => (
              <View key={h.symbol} style={styles.holdingCard}>
                <View>
                  <Text style={styles.symbol}>{h.symbol}</Text>
                  <Text style={styles.name}>{h.name}</Text>
                </View>
                <View style={styles.holdingRight}>
                  <Text style={styles.value}>{h.value}</Text>
                  <Text style={styles.weight}>{h.weight}</Text>
                </View>
              </View>
            ))}
          </>
        )}
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
  headerActions: { flexDirection: "row", alignItems: "center", gap: scale(8) },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
  },
  refreshButton: {
    backgroundColor: "#eef2ff",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 999,
  },
  refreshText: { color: "#4338ca", fontSize: moderateScale(11), fontWeight: "600" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    backgroundColor: "#ecfdf3",
    borderRadius: 999,
  },
  badgeText: { color: "#16a34a", fontSize: moderateScale(12), fontWeight: "600" },
  updatedText: {
    alignSelf: "flex-start",
    fontSize: moderateScale(11),
    color: "#64748b",
    marginBottom: verticalScale(10),
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: verticalScale(16),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(10),
  },
  cardTitle: { fontSize: moderateScale(14), fontWeight: "700", color: "#0f172a" },
  allocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  dot: {
    width: scale(10),
    height: scale(10),
    borderRadius: 5,
    marginRight: scale(8),
  },
  allocationLabel: { flex: 1, fontSize: moderateScale(13), color: "#334155" },
  allocationValue: { fontSize: moderateScale(13), fontWeight: "700", color: "#0f172a" },
  sectionHeader: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: verticalScale(10),
  },
  holdingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(14),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: verticalScale(10),
  },
  symbol: { fontSize: moderateScale(15), fontWeight: "700", color: "#0f172a" },
  name: { fontSize: moderateScale(12), color: "#64748b", marginTop: 2 },
  holdingRight: { alignItems: "flex-end" },
  value: { fontSize: moderateScale(14), fontWeight: "600", color: "#0f172a" },
  weight: { fontSize: moderateScale(12), color: "#16a34a", marginTop: 2 },
  loading: { alignItems: "center", gap: verticalScale(6), marginVertical: 12 },
  loadingText: { color: "#4338ca", fontSize: moderateScale(12) },
});
