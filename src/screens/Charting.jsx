import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LineChart, TrendingUp } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

const ranges = ["1D", "1W", "1M", "1Y"];
const chartPoints = [18, 22, 16, 28, 24, 30, 26, 34, 29, 36];

export default function Charting() {
  const maxValue = Math.max(...chartPoints);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Charting Tools</Text>
          <View style={styles.badge}>
            <TrendingUp size={14} color="#16a34a" />
            <Text style={styles.badgeText}>Realtime</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.symbolRow}>
            <LineChart size={18} color="#2563eb" />
            <Text style={styles.symbol}>DBS</Text>
            <Text style={styles.price}>$35.40</Text>
            <Text style={styles.change}>+1.2%</Text>
          </View>

          <View style={styles.rangeRow}>
            {ranges.map((r) => (
              <TouchableOpacity key={r} style={styles.rangeButton}>
                <Text style={styles.rangeText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.chartArea}>
            {chartPoints.map((value, index) => (
              <View key={`${value}-${index}`} style={styles.barWrap}>
                <View
                  style={[
                    styles.bar,
                    { height: `${(value / maxValue) * 100}%` },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.secondaryCard}>
          <Text style={styles.secondaryHeader}>Indicators</Text>
          <View style={styles.indicatorRow}>
            <Text style={styles.indicator}>MA (20)</Text>
            <Text style={styles.indicator}>RSI (14)</Text>
            <Text style={styles.indicator}>MACD</Text>
            <Text style={styles.indicator}>Volume</Text>
          </View>
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
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
  },
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
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  symbolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(12),
  },
  symbol: { fontSize: moderateScale(16), fontWeight: "700", color: "#0f172a" },
  price: { fontSize: moderateScale(14), fontWeight: "600", color: "#0f172a" },
  change: { fontSize: moderateScale(12), color: "#16a34a", marginLeft: "auto" },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  rangeButton: {
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  rangeText: { fontSize: moderateScale(12), color: "#475569", fontWeight: "600" },
  chartArea: {
    height: verticalScale(160),
    flexDirection: "row",
    alignItems: "flex-end",
    gap: scale(6),
  },
  barWrap: { flex: 1, alignItems: "center" },
  bar: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  secondaryCard: {
    marginTop: verticalScale(16),
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  secondaryHeader: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: verticalScale(8),
  },
  indicatorRow: { flexDirection: "row", flexWrap: "wrap", gap: scale(8) },
  indicator: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    fontSize: moderateScale(12),
    color: "#334155",
    fontWeight: "600",
  },
});
