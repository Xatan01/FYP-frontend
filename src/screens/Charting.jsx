import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LineChart, TrendingUp } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import { fetchMarketChart } from "../api/market";

const ranges = ["1D", "1W", "1M", "1Y"];
const indicators = ["MA(20)", "RSI", "MACD", "Volume"];

export default function Charting({ route }) {
  const routeSymbol = String(route?.params?.symbol || "").trim().toUpperCase();
  const [symbol, setSymbol] = useState(routeSymbol || "AAPL");
  const [range, setRange] = useState(ranges[1]);
  const [activeIndicators, setActiveIndicators] = useState(["MA(20)", "Volume"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("Not updated");
  const [chartPoints, setChartPoints] = useState([]);
  const [price, setPrice] = useState(null);
  const [changePercent, setChangePercent] = useState(null);

  const maxValue = useMemo(() => {
    if (!chartPoints.length) return 1;
    return Math.max(...chartPoints, 1);
  }, [chartPoints]);

  const toggleIndicator = (label) => {
    if (activeIndicators.includes(label)) {
      setActiveIndicators(activeIndicators.filter((item) => item !== label));
      return;
    }
    setActiveIndicators([...activeIndicators, label]);
  };

  const loadChart = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMarketChart(symbol, range);
      const points = (data?.points || [])
        .map((item) => Number(item?.c))
        .filter((value) => Number.isFinite(value));
      setChartPoints(points);
      setPrice(Number.isFinite(Number(data?.price)) ? Number(data.price) : null);
      setChangePercent(
        Number.isFinite(Number(data?.change_percent)) ? Number(data.change_percent) : null
      );
      const updated = data?.updated_at ? new Date(data.updated_at) : new Date();
      setLastUpdated(updated.toLocaleTimeString());
    } catch (err) {
      setError(err?.message || "Failed to load chart.");
      setChartPoints([]);
      setPrice(null);
      setChangePercent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeSymbol && routeSymbol !== symbol) {
      setSymbol(routeSymbol);
    }
  }, [routeSymbol, symbol]);

  useEffect(() => {
    loadChart();
  }, [range, symbol]);

  const handleRefresh = () => {
    loadChart();
  };

  const priceText = price === null ? "--" : `$${price.toFixed(2)}`;
  const changeText =
    changePercent === null ? "--" : `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;
  const changeTone =
    changePercent === null ? "#64748b" : changePercent >= 0 ? "#16a34a" : "#dc2626";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Charting Tools</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
            <View style={styles.badge}>
              <TrendingUp size={14} color="#16a34a" />
              <Text style={styles.badgeText}>Realtime</Text>
            </View>
          </View>
        </View>
        <Text style={styles.updatedText}>Last updated: {lastUpdated}</Text>
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Refreshing chart...</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.symbolRow}>
              <LineChart size={18} color="#2563eb" />
              <Text style={styles.symbol}>{symbol}</Text>
              <Text style={styles.price}>{priceText}</Text>
              <Text style={[styles.change, { color: changeTone }]}>{changeText}</Text>
            </View>

            <View style={styles.rangeRow}>
              {ranges.map((r) => {
                const active = r === range;
                return (
                  <TouchableOpacity
                    key={r}
                    style={styles.rangeButton}
                    onPress={() => setRange(r)}
                  >
                    <Text
                      style={[styles.rangeText, active && styles.rangeTextActive]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.chartArea}>
              {chartPoints.length ? (
                chartPoints.map((value, index) => (
                  <View key={`${value}-${index}`} style={styles.barWrap}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${(value / maxValue) * 100}%` },
                      ]}
                    />
                  </View>
                ))
              ) : (
                <View style={styles.emptyChartWrap}>
                  <Text style={styles.emptyChartText}>No chart data available.</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.secondaryCard}>
          <Text style={styles.secondaryHeader}>Indicators</Text>
          <View style={styles.indicatorRow}>
            {indicators.map((indicator) => {
              const active = activeIndicators.includes(indicator);
              return (
                <TouchableOpacity
                  key={indicator}
                  style={[styles.indicator, active && styles.indicatorActive]}
                  onPress={() => toggleIndicator(indicator)}
                >
                  <Text
                    style={[
                      styles.indicatorText,
                      active && styles.indicatorTextActive,
                    ]}
                  >
                    {indicator}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
  headerActions: { flexDirection: "row", alignItems: "center", gap: scale(8) },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
  },
  refreshButton: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 999,
  },
  refreshText: { color: "#2563eb", fontSize: moderateScale(11), fontWeight: "600" },
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
  errorText: {
    alignSelf: "flex-start",
    color: "#dc2626",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(10),
  },
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
  rangeTextActive: { color: "#2563eb" },
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
  emptyChartWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChartText: {
    color: "#64748b",
    fontSize: moderateScale(12),
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
  },
  indicatorActive: {
    backgroundColor: "#2563eb",
  },
  indicatorText: {
    fontSize: moderateScale(12),
    color: "#334155",
    fontWeight: "600",
  },
  indicatorTextActive: { color: "#fff" },
  loading: { alignItems: "center", gap: verticalScale(6), marginVertical: 12 },
  loadingText: { color: "#2563eb", fontSize: moderateScale(12) },
});
