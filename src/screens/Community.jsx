import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown, DollarSign, Percent, Trophy, Users, Zap } from "lucide-react-native";
import { moderateScale, scale, verticalScale } from "../styles/responsive";
import { fetchLeaderboards } from "../api/leaderboard";
import { useAuth } from "../context/AuthContext";

const METRIC_TABS = [
  { key: "xp", label: "Learning XP", icon: Zap },
  { key: "equity", label: "Stock Equity", icon: DollarSign },
  { key: "equity_return_pct", label: "Stock Return %", icon: Percent },
];

function formatMetricValue(metric, raw) {
  const value = Number(raw);
  if (!Number.isFinite(value)) return "--";
  if (metric === "xp") return `${Math.round(value).toLocaleString()} XP`;
  if (metric === "equity") {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function rankBadgeStyle(rank) {
  if (rank === 1) return styles.rankGold;
  if (rank === 2) return styles.rankSilver;
  if (rank === 3) return styles.rankBronze;
  return styles.rankDefault;
}

function valueStyle(metric, value) {
  if (metric !== "equity_return_pct") return styles.valueDefault;
  const num = Number(value);
  if (num > 0) return styles.valuePositive;
  if (num < 0) return styles.valueNegative;
  return styles.valueNeutral;
}

function LeaderboardCard({ title, icon: Icon, metric, rows, meUserId }) {
  const items = Array.isArray(rows) ? rows : [];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon size={16} color="#93c5fd" />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>

      {items.length ? (
        items.map((row) => (
          <View
            key={`${metric}-${row.user_id}`}
            style={[
              styles.row,
              String(row.user_id).toLowerCase() === String(meUserId || "").toLowerCase()
                ? styles.myRow
                : styles.rowDivider,
            ]}
          >
            <View style={[styles.rankBadge, rankBadgeStyle(row.rank)]}>
              {row.rank <= 3 ? <Crown size={12} color="#0f172a" /> : null}
              <Text style={styles.rankText}>#{row.rank}</Text>
            </View>
            <Text style={styles.username}>@{row.username}</Text>
            <Text style={[styles.value, valueStyle(metric, row.value)]}>
              {formatMetricValue(metric, row.value)}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No data yet.</Text>
      )}
    </View>
  );
}

export default function Community() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [leaderboards, setLeaderboards] = useState(null);
  const [activeMetric, setActiveMetric] = useState("xp");

  const activeTab = useMemo(
    () => METRIC_TABS.find((tab) => tab.key === activeMetric) || METRIC_TABS[0],
    [activeMetric]
  );

  const loadLeaderboards = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const data = await fetchLeaderboards();
      setLeaderboards(data || null);
    } catch (err) {
      setError(err?.message || "Failed to load leaderboards.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboards({ showLoading: true });
  }, [loadLeaderboards]);

  const globalRows = leaderboards?.global?.[activeMetric] || [];
  const friendRows = leaderboards?.friends?.[activeMetric] || [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#1e293b", "#0f172a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleWrap}>
              <Trophy size={20} color="#facc15" />
              <Text style={styles.heroTitle}>Community Leaderboards</Text>
            </View>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => loadLeaderboards({ showLoading: false })}
              disabled={refreshing}
            >
              <Text style={styles.refreshText}>{refreshing ? "Refreshing..." : "Refresh"}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroSubtitle}>
            Compete on learning and virtual market performance.
          </Text>

          <View style={styles.tabRow}>
            {METRIC_TABS.map((tab) => {
              const Icon = tab.icon;
              const selected = tab.key === activeMetric;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabBtn, selected ? styles.tabBtnActive : null]}
                  onPress={() => setActiveMetric(tab.key)}
                >
                  <Icon size={14} color={selected ? "#0f172a" : "#cbd5e1"} />
                  <Text style={[styles.tabText, selected ? styles.tabTextActive : null]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        {loading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator color="#7dd3fc" />
            <Text style={styles.centerText}>Loading leaderboards...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.centerCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadLeaderboards({ showLoading: true })}
            >
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && !error ? (
          <>
            <LeaderboardCard
              title={`Global ${activeTab.label}`}
              icon={Trophy}
              metric={activeMetric}
              rows={globalRows}
              meUserId={user?.id}
            />
            <LeaderboardCard
              title={`Friends ${activeTab.label}`}
              icon={Users}
              metric={activeMetric}
              rows={friendRows}
              meUserId={user?.id}
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  container: {
    padding: scale(18),
    paddingBottom: verticalScale(48),
  },
  hero: {
    borderRadius: 20,
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: verticalScale(14),
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: scale(8),
  },
  heroTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    flex: 1,
  },
  heroTitle: {
    color: "#e2e8f0",
    fontSize: moderateScale(22),
    fontWeight: "800",
    flexShrink: 1,
  },
  heroSubtitle: {
    color: "#94a3b8",
    fontSize: moderateScale(13),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(12),
  },
  refreshBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#1e3a8a",
    borderRadius: 10,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
  },
  refreshText: {
    color: "#dbeafe",
    fontSize: moderateScale(11),
    fontWeight: "700",
  },
  tabRow: {
    flexDirection: "row",
    gap: scale(8),
    flexWrap: "wrap",
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#111827",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
  },
  tabBtnActive: {
    backgroundColor: "#fde047",
    borderColor: "#eab308",
  },
  tabText: {
    color: "#cbd5e1",
    fontSize: moderateScale(11),
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#0f172a",
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: scale(14),
    marginBottom: verticalScale(12),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginBottom: verticalScale(8),
  },
  cardTitle: {
    color: "#e2e8f0",
    fontSize: moderateScale(15),
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(7),
    gap: scale(8),
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  myRow: {
    borderWidth: 1,
    borderColor: "#22d3ee",
    borderRadius: 10,
    backgroundColor: "#082f49",
    paddingHorizontal: scale(6),
    marginVertical: verticalScale(2),
  },
  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(2),
    borderRadius: 999,
    paddingHorizontal: scale(7),
    paddingVertical: verticalScale(3),
    minWidth: scale(46),
    justifyContent: "center",
  },
  rankGold: {
    backgroundColor: "#facc15",
  },
  rankSilver: {
    backgroundColor: "#cbd5e1",
  },
  rankBronze: {
    backgroundColor: "#fdba74",
  },
  rankDefault: {
    backgroundColor: "#334155",
  },
  rankText: {
    color: "#0f172a",
    fontSize: moderateScale(10),
    fontWeight: "800",
  },
  username: {
    color: "#e2e8f0",
    fontSize: moderateScale(12),
    fontWeight: "700",
    flex: 1,
  },
  value: {
    fontSize: moderateScale(12),
    fontWeight: "800",
  },
  valueDefault: {
    color: "#f8fafc",
  },
  valuePositive: {
    color: "#86efac",
  },
  valueNegative: {
    color: "#fca5a5",
  },
  valueNeutral: {
    color: "#cbd5e1",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: moderateScale(12),
    textAlign: "center",
    paddingVertical: verticalScale(8),
  },
  centerCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: scale(14),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(12),
  },
  centerText: {
    color: "#cbd5e1",
    fontSize: moderateScale(13),
    marginTop: verticalScale(8),
    textAlign: "center",
  },
  errorText: {
    color: "#fca5a5",
    fontSize: moderateScale(13),
    textAlign: "center",
  },
  retryBtn: {
    marginTop: verticalScale(10),
    backgroundColor: "#1e40af",
    borderRadius: 10,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
  },
  retryText: {
    color: "#dbeafe",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
});
