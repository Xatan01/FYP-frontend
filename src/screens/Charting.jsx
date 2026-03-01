import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LineChart, TrendingUp } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import { fetchMarketChart } from "../api/market";
import TradingViewChart from "../components/TradingViewChart";

const ranges = ["1D", "1W", "1M", "1Y"];
const indicators = ["MA(20)", "RSI", "MACD", "Volume"];

function toTimestampMs(point) {
  const direct = Number(point?.timestamp);
  if (Number.isFinite(direct)) return direct;
  const parsed = Date.parse(point?.time || point?.t || "");
  return Number.isFinite(parsed) ? parsed : null;
}

function toTvTime(ts) {
  const sec = Math.floor(Number(ts) / 1000);
  return Number.isFinite(sec) ? sec : null;
}

function buildSma(candles, period) {
  let sum = 0;
  const out = [];
  for (let i = 0; i < candles.length; i += 1) {
    const close = candles[i].close;
    sum += close;
    if (i >= period) sum -= candles[i - period].close;
    if (i >= period - 1) {
      out.push({ time: candles[i].time, value: sum / period });
    }
  }
  return out;
}

function buildRsi(candles, period = 14) {
  if (candles.length <= period) return [];
  let gainSum = 0;
  let lossSum = 0;

  for (let i = 1; i <= period; i += 1) {
    const delta = candles[i].close - candles[i - 1].close;
    if (delta >= 0) gainSum += delta;
    else lossSum += Math.abs(delta);
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  const out = [];

  const firstRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  out.push({
    time: candles[period].time,
    value: avgLoss === 0 ? 100 : 100 - 100 / (1 + firstRs),
  });

  for (let i = period + 1; i < candles.length; i += 1) {
    const delta = candles[i].close - candles[i - 1].close;
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? Math.abs(delta) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const value = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
    out.push({ time: candles[i].time, value });
  }

  return out;
}

function buildEma(values, period) {
  if (values.length < period) return [];
  const k = 2 / (period + 1);
  let ema = 0;
  for (let i = 0; i < period; i += 1) ema += values[i];
  ema /= period;

  const out = new Array(values.length).fill(null);
  out[period - 1] = ema;

  for (let i = period; i < values.length; i += 1) {
    ema = values[i] * k + ema * (1 - k);
    out[i] = ema;
  }
  return out;
}

function buildMacd(candles) {
  const closes = candles.map((c) => c.close);
  const ema12 = buildEma(closes, 12);
  const ema26 = buildEma(closes, 26);
  const macdRaw = closes.map((_, i) => {
    if (ema12[i] == null || ema26[i] == null) return null;
    return ema12[i] - ema26[i];
  });

  const validMacd = macdRaw.filter((v) => v != null);
  const signalValid = buildEma(validMacd, 9);

  const signalRaw = new Array(macdRaw.length).fill(null);
  let ptr = 0;
  for (let i = 0; i < macdRaw.length; i += 1) {
    if (macdRaw[i] == null) continue;
    signalRaw[i] = signalValid[ptr];
    ptr += 1;
  }

  const macdLine = [];
  const signalLine = [];
  const histogram = [];
  for (let i = 0; i < candles.length; i += 1) {
    const m = macdRaw[i];
    const s = signalRaw[i];
    if (m == null) continue;
    macdLine.push({ time: candles[i].time, value: m });
    if (s != null) {
      signalLine.push({ time: candles[i].time, value: s });
      const h = m - s;
      histogram.push({
        time: candles[i].time,
        value: h,
        color: h >= 0 ? "rgba(34,197,94,0.55)" : "rgba(239,68,68,0.55)",
      });
    }
  }

  return { macdLine, signalLine, histogram };
}

export default function Charting({ route }) {
  const routeSymbol = String(route?.params?.symbol || "").trim().toUpperCase();
  const [symbol, setSymbol] = useState(routeSymbol || "AAPL");
  const [range, setRange] = useState(ranges[1]);
  const [activeIndicators, setActiveIndicators] = useState(["MA(20)", "Volume"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("Not updated");
  const [candles, setCandles] = useState([]);
  const [price, setPrice] = useState(null);
  const [changePercent, setChangePercent] = useState(null);

  const showMA = activeIndicators.includes("MA(20)");
  const showRSI = activeIndicators.includes("RSI");
  const showMACD = activeIndicators.includes("MACD");
  const showVolume = activeIndicators.includes("Volume");

  const maSeries = useMemo(() => buildSma(candles, 20), [candles]);
  const rsiSeries = useMemo(() => buildRsi(candles, 14), [candles]);
  const macd = useMemo(() => buildMacd(candles), [candles]);

  const toggleIndicator = (label) => {
    setActiveIndicators((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const loadChart = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMarketChart(symbol, range);
      const mapped = (data?.points || [])
        .map((point) => {
          const ts = toTimestampMs(point);
          const time = toTvTime(ts);
          return {
            timestamp: ts,
            time,
            open: Number(point?.open),
            high: Number(point?.high),
            low: Number(point?.low),
            close: Number(point?.close ?? point?.c),
            volume: Number(point?.volume ?? point?.v),
          };
        })
        .filter(
          (c) =>
            Number.isFinite(c.timestamp) &&
            Number.isFinite(c.time) &&
            Number.isFinite(c.open) &&
            Number.isFinite(c.high) &&
            Number.isFinite(c.low) &&
            Number.isFinite(c.close)
        )
        .map((c) => ({
          ...c,
          volume: Number.isFinite(c.volume) ? c.volume : null,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

      setCandles(mapped);
      setPrice(Number.isFinite(Number(data?.price)) ? Number(data.price) : null);
      setChangePercent(
        Number.isFinite(Number(data?.change_percent)) ? Number(data.change_percent) : null
      );
      const updated = data?.updated_at ? new Date(data.updated_at) : new Date();
      setLastUpdated(updated.toLocaleTimeString());
    } catch (err) {
      setError(err?.message || "Failed to load chart.");
      setCandles([]);
      setPrice(null);
      setChangePercent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeSymbol && routeSymbol !== symbol) setSymbol(routeSymbol);
  }, [routeSymbol, symbol]);

  useEffect(() => {
    loadChart();
  }, [range, symbol]);

  const priceText = price === null ? "--" : `$${price.toFixed(2)}`;
  const changeText =
    changePercent === null ? "--" : `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;
  const changeTone =
    changePercent === null ? "#64748b" : changePercent >= 0 ? "#16a34a" : "#dc2626";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, { padding: scale(16) }]}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Charting Tools</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshButton} onPress={loadChart}>
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
                  <TouchableOpacity key={r} style={styles.rangeButton} onPress={() => setRange(r)}>
                    <Text style={[styles.rangeText, active && styles.rangeTextActive]}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {candles.length ? (
              <TradingViewChart
                candles={candles}
                maSeries={maSeries}
                rsiSeries={rsiSeries}
                macdLine={macd.macdLine}
                macdSignal={macd.signalLine}
                macdHistogram={macd.histogram}
                showMA={showMA}
                showRSI={showRSI}
                showMACD={showMACD}
                showVolume={showVolume}
              />
            ) : (
              <View style={styles.emptyChartWrap}>
                <Text style={styles.emptyChartText}>No chart data available.</Text>
              </View>
            )}
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
                  <Text style={[styles.indicatorText, active && styles.indicatorTextActive]}>
                    {indicator}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
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
    color: "#f8fafc",
  },
  refreshButton: {
    backgroundColor: "#1e293b",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 999,
  },
  refreshText: { color: "#93c5fd", fontSize: moderateScale(11), fontWeight: "600" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    backgroundColor: "#064e3b",
    borderRadius: 999,
  },
  badgeText: { color: "#6ee7b7", fontSize: moderateScale(12), fontWeight: "600" },
  updatedText: {
    alignSelf: "flex-start",
    fontSize: moderateScale(11),
    color: "#94a3b8",
    marginBottom: verticalScale(10),
  },
  errorText: {
    alignSelf: "flex-start",
    color: "#fca5a5",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  symbolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(12),
  },
  symbol: { fontSize: moderateScale(16), fontWeight: "700", color: "#f8fafc" },
  price: { fontSize: moderateScale(14), fontWeight: "600", color: "#f8fafc" },
  change: { fontSize: moderateScale(12), marginLeft: "auto" },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  rangeButton: {
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
    borderRadius: 999,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
  },
  rangeText: { fontSize: moderateScale(12), color: "#94a3b8", fontWeight: "600" },
  rangeTextActive: { color: "#93c5fd" },
  emptyChartWrap: {
    minHeight: verticalScale(220),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChartText: {
    color: "#94a3b8",
    fontSize: moderateScale(12),
  },
  secondaryCard: {
    marginTop: verticalScale(16),
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  secondaryHeader: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: verticalScale(8),
  },
  indicatorRow: { flexDirection: "row", flexWrap: "wrap", gap: scale(8) },
  indicator: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    backgroundColor: "#111827",
    borderRadius: 10,
  },
  indicatorActive: {
    backgroundColor: "#2563eb",
  },
  indicatorText: {
    fontSize: moderateScale(12),
    color: "#cbd5e1",
    fontWeight: "600",
  },
  indicatorTextActive: { color: "#fff" },
  loading: { alignItems: "center", gap: verticalScale(6), marginVertical: 12 },
  loadingText: { color: "#93c5fd", fontSize: moderateScale(12) },
});
