import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Brain, RefreshCw, Search, Shield, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale, scale, verticalScale } from "../styles/responsive";
import { useAppTheme } from "../context/ThemeContext";
import LoadingState from "../components/LoadingState";
import { fetchAITraderSignals } from "../api/aiTrader";

const DEFAULT_TICKERS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"];

function formatPercent(value) {
  const num = Number(value ?? 0);
  return `${Math.round(num * 100)}%`;
}

function formatDateTime(value) {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString();
}

function getSignalAppearance(signal, palette) {
  if (signal === "BUY") {
    return {
      bg: palette.successSoft,
      text: palette.successSoftText,
      label: "Bullish / Buy",
    };
  }
  if (signal === "SELL") {
    return {
      bg: palette.dangerSoft,
      text: palette.dangerSoftText,
      label: "Bearish / Sell",
    };
  }
  return {
    bg: palette.warningSoft,
    text: palette.warningSoftText,
    label: "Neutral / Hold",
  };
}

function ProbabilityBar({ label, value, fillColor, palette }) {
  return (
    <View style={stylesInline.metricBlock}>
      <View style={stylesInline.metricHeader}>
        <Text style={[stylesInline.metricLabel, { color: palette.textSecondary }]}>{label}</Text>
        <Text style={[stylesInline.metricValue, { color: palette.textPrimary }]}>{formatPercent(value)}</Text>
      </View>
      <View style={[stylesInline.metricTrack, { backgroundColor: palette.cardMuted, borderColor: palette.cardBorder }]}>
        <View style={[stylesInline.metricFill, { width: `${Math.max(0, Math.min(100, Number(value ?? 0) * 100))}%`, backgroundColor: fillColor }]} />
      </View>
    </View>
  );
}

export default function AITraderPersonalities() {
  const { palette, isLight } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette, isLight), [palette, isLight]);

  const [symbolQuery, setSymbolQuery] = useState("AAPL");
  const [activeSymbol, setActiveSymbol] = useState("AAPL");
  const [signals, setSignals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  const loadSignals = useCallback(async (ticker, { quiet = false } = {}) => {
    const cleanTicker = String(ticker || "").trim().toUpperCase();
    if (!cleanTicker) return;

    if (quiet) setRefreshing(true);
    else setLoading(true);

    try {
      setError("");
      const result = await fetchAITraderSignals(cleanTicker);
      setSignals(result);
      setActiveSymbol(cleanTicker);
      setSymbolQuery(cleanTicker);
      setSearching(false);
    } catch (err) {
      setError(err?.message || "Failed to load AI trader signals.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSignals("AAPL");
  }, [loadSignals]);

  useEffect(() => {
    const cleanQuery = symbolQuery.trim().toUpperCase();
    if (cleanQuery.length >= 2 && cleanQuery !== activeSymbol) {
      setSearching(true);
      const timeout = setTimeout(() => setSearching(false), 180);
      return () => clearTimeout(timeout);
    }

    setSearching(false);
    return undefined;
  }, [symbolQuery]);

  const handleSubmit = useCallback(() => {
    loadSignals(symbolQuery);
  }, [loadSignals, symbolQuery]);

  const topSummary = useMemo(() => {
    const items = Array.isArray(signals?.items) ? signals.items : [];
    if (!items.length) return null;
    const buys = items.filter((item) => item.signal === "BUY").length;
    const sells = items.filter((item) => item.signal === "SELL").length;
    const holds = items.filter((item) => item.signal === "HOLD").length;
    const regimeLabel = items[0]?.regime_label === "bear" ? "Bear regime" : "Bull regime";
    return { buys, sells, holds, regimeLabel };
  }, [signals]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={[palette.heroStart, palette.heroEnd]} style={styles.hero}>
          <View style={styles.heroHeader}>
            <View style={styles.heroBadge}>
              <Brain size={16} color={palette.accent} />
              <Text style={styles.heroBadgeText}>AI Trader Personalities</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Compare the same stock through three trading styles.</Text>
          <Text style={styles.heroSubtitle}>
            Conservative, balanced, and aggressive personalities all run on the trained model bundles,
            but they act differently because their thresholds, sizing rules, and risk tolerances differ.
          </Text>
        </LinearGradient>

        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrap}>
              <Search size={16} color={palette.textMuted} />
              <TextInput
                value={symbolQuery}
                onChangeText={setSymbolQuery}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="Search symbol or type ticker"
                placeholderTextColor={palette.textMuted}
                style={styles.searchInput}
                onSubmitEditing={handleSubmit}
              />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={handleSubmit}>
              <Text style={styles.searchButtonText}>Run</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tickerChipRow}>
            {DEFAULT_TICKERS.map((ticker) => {
              const active = activeSymbol === ticker;
              return (
                <TouchableOpacity
                  key={ticker}
                  style={[styles.tickerChip, active && styles.tickerChipActive]}
                  onPress={() => loadSignals(ticker)}
                >
                  <Text style={[styles.tickerChipText, active && styles.tickerChipTextActive]}>
                    {ticker}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {searching ? (
            <Text style={styles.helperText}>Type a ticker manually or use the fast chips.</Text>
          ) : null}
        </View>

        {loading ? (
          <LoadingState style={styles.loadingCard} />
        ) : (
          <>
            {error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>Signals unavailable</Text>
                <Text style={styles.errorBody}>{error}</Text>
              </View>
            ) : null}

            {signals && topSummary ? (
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <View>
                    <Text style={styles.summaryTitle}>{signals.ticker}</Text>
                    <Text style={styles.summarySubtitle}>
                      {topSummary.regimeLabel} based on {signals.benchmark_ticker} context
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={() => loadSignals(activeSymbol, { quiet: true })}
                    disabled={refreshing}
                  >
                    <RefreshCw size={15} color={palette.accent} />
                    <Text style={styles.refreshBtnText}>{refreshing ? "Refreshing" : "Refresh"}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.summaryStatsRow}>
                  <View style={styles.summaryPill}>
                    <Text style={styles.summaryPillLabel}>BUY</Text>
                    <Text style={styles.summaryPillValue}>{topSummary.buys}</Text>
                  </View>
                  <View style={styles.summaryPill}>
                    <Text style={styles.summaryPillLabel}>HOLD</Text>
                    <Text style={styles.summaryPillValue}>{topSummary.holds}</Text>
                  </View>
                  <View style={styles.summaryPill}>
                    <Text style={styles.summaryPillLabel}>SELL</Text>
                    <Text style={styles.summaryPillValue}>{topSummary.sells}</Text>
                  </View>
                </View>

                <Text style={styles.metaText}>
                  Generated: {formatDateTime(signals.generated_at)}
                </Text>
                <Text style={styles.metaText}>
                  Latest trained bundle update: {formatDateTime(signals.model_bundle_updated_at)}
                </Text>
                <Text style={styles.metaText}>
                  Benchmark training data through: {signals.benchmark_last_date || "N/A"}
                </Text>
              </View>
            ) : null}

            {Array.isArray(signals?.items)
              ? signals.items.map((item) => {
                  const appearance = getSignalAppearance(item.signal, palette);
                  return (
                    <View key={item.personality} style={styles.personalityCard}>
                      <View style={styles.personalityHeader}>
                        <View>
                          <View style={styles.personalityTitleRow}>
                            <Sparkles size={15} color={palette.accent} />
                            <Text style={styles.personalityTitle}>
                              {item.personality.charAt(0).toUpperCase() + item.personality.slice(1)}
                            </Text>
                          </View>
                          <Text style={styles.personalityBody}>{item.description}</Text>
                        </View>
                        <View style={[styles.signalBadge, { backgroundColor: appearance.bg }]}>
                          <Text style={[styles.signalBadgeText, { color: appearance.text }]}>
                            {appearance.label}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.probabilityWrap}>
                        <ProbabilityBar label="Bull probability" value={item.bull_prob} fillColor={palette.success} palette={palette} />
                        <ProbabilityBar label="Hold probability" value={item.hold_prob} fillColor={palette.warning} palette={palette} />
                        <ProbabilityBar label="Bear probability" value={item.bear_prob} fillColor={palette.danger} palette={palette} />
                      </View>

                      <View style={styles.detailGrid}>
                        <View style={styles.detailPill}>
                          <Text style={styles.detailLabel}>Suggested size</Text>
                          <Text style={styles.detailValue}>{formatPercent(item.size)}</Text>
                        </View>
                        <View style={styles.detailPill}>
                          <Text style={styles.detailLabel}>Buy threshold</Text>
                          <Text style={styles.detailValue}>{formatPercent(item.bull_threshold)}</Text>
                        </View>
                        <View style={styles.detailPill}>
                          <Text style={styles.detailLabel}>Sell threshold</Text>
                          <Text style={styles.detailValue}>{formatPercent(item.bear_threshold)}</Text>
                        </View>
                        <View style={styles.detailPill}>
                          <Text style={styles.detailLabel}>Max allocation</Text>
                          <Text style={styles.detailValue}>{formatPercent(item.max_allocation)}</Text>
                        </View>
                        <View style={styles.detailPill}>
                          <Text style={styles.detailLabel}>Target annual vol</Text>
                          <Text style={styles.detailValue}>{formatPercent(item.target_annual_vol)}</Text>
                        </View>
                        <View style={styles.detailPill}>
                          <Text style={styles.detailLabel}>Drawdown brake</Text>
                          <Text style={styles.detailValue}>{formatPercent(item.max_drawdown_limit)}</Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <Shield size={14} color={palette.textMuted} />
                        <Text style={styles.infoText}>
                          Margin threshold {formatPercent(item.margin_threshold)}. Neutral action: {item.neutral_action}.
                        </Text>
                      </View>
                      <Text style={styles.infoText}>
                        Latest model signal date: {item.as_of_date}. Kelly fraction: {formatPercent(item.kelly_fraction)}.
                      </Text>
                    </View>
                  );
                })
              : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const stylesInline = StyleSheet.create({
  metricBlock: {
    gap: 6,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLabel: {
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
  metricValue: {
    fontSize: moderateScale(12),
    fontWeight: "800",
  },
  metricTrack: {
    height: verticalScale(9),
    borderRadius: scale(999),
    overflow: "hidden",
    borderWidth: 1,
  },
  metricFill: {
    height: "100%",
    borderRadius: scale(999),
  },
});

function buildStyles(palette, isLight) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: palette.background,
    },
    container: {
      flex: 1,
    },
    content: {
      padding: scale(18),
      gap: verticalScale(16),
      paddingBottom: verticalScale(32),
    },
    hero: {
      borderRadius: scale(24),
      paddingHorizontal: scale(18),
      paddingTop: verticalScale(18),
      paddingBottom: verticalScale(22),
      borderWidth: 1,
      borderColor: palette.cardBorder,
    },
    heroHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      backgroundColor: isLight ? "rgba(255,255,255,0.72)" : "rgba(15,23,42,0.35)",
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(6),
      borderRadius: scale(999),
    },
    heroBadgeText: {
      color: palette.textPrimary,
      fontSize: moderateScale(11),
      fontWeight: "800",
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    heroTitle: {
      marginTop: verticalScale(12),
      color: palette.textPrimary,
      fontSize: moderateScale(24),
      fontWeight: "900",
      lineHeight: moderateScale(29),
    },
    heroSubtitle: {
      marginTop: verticalScale(8),
      color: palette.textSecondary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(20),
    },
    searchCard: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderRadius: scale(20),
      padding: scale(16),
      gap: verticalScale(12),
    },
    searchRow: {
      flexDirection: "row",
      gap: scale(10),
    },
    searchInputWrap: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      backgroundColor: palette.input,
      borderWidth: 1,
      borderColor: palette.inputBorder,
      borderRadius: scale(14),
      paddingHorizontal: scale(12),
      minHeight: verticalScale(46),
    },
    searchInput: {
      flex: 1,
      color: palette.textPrimary,
      fontSize: moderateScale(14),
      fontWeight: "600",
      paddingVertical: verticalScale(10),
    },
    searchButton: {
      minWidth: scale(72),
      borderRadius: scale(14),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.accent,
      paddingHorizontal: scale(14),
    },
    searchButtonText: {
      color: palette.accentText,
      fontSize: moderateScale(13),
      fontWeight: "800",
    },
    tickerChipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(8),
    },
    tickerChip: {
      borderRadius: scale(999),
      borderWidth: 1,
      borderColor: palette.cardBorder,
      backgroundColor: palette.cardMuted,
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(8),
    },
    tickerChipActive: {
      borderColor: palette.accent,
      backgroundColor: palette.accentSoft,
    },
    tickerChipText: {
      color: palette.textSecondary,
      fontSize: moderateScale(12),
      fontWeight: "700",
    },
    tickerChipTextActive: {
      color: palette.accentSoftText,
    },
    helperText: {
      color: palette.textMuted,
      fontSize: moderateScale(12),
    },
    loadingCard: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderRadius: scale(20),
      paddingVertical: verticalScale(24),
    },
    errorCard: {
      backgroundColor: palette.dangerSoft,
      borderWidth: 1,
      borderColor: palette.danger,
      borderRadius: scale(18),
      padding: scale(16),
    },
    errorTitle: {
      color: palette.dangerSoftText,
      fontSize: moderateScale(16),
      fontWeight: "800",
    },
    errorBody: {
      marginTop: verticalScale(6),
      color: palette.dangerSoftText,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(19),
    },
    summaryCard: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderRadius: scale(20),
      padding: scale(16),
      gap: verticalScale(12),
    },
    summaryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: scale(12),
      alignItems: "flex-start",
    },
    summaryTitle: {
      color: palette.textPrimary,
      fontSize: moderateScale(20),
      fontWeight: "900",
    },
    summarySubtitle: {
      marginTop: verticalScale(4),
      color: palette.textSecondary,
      fontSize: moderateScale(12),
      lineHeight: moderateScale(18),
    },
    refreshBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(8),
      borderRadius: scale(12),
      backgroundColor: palette.accentSoft,
    },
    refreshBtnText: {
      color: palette.accentSoftText,
      fontSize: moderateScale(12),
      fontWeight: "800",
    },
    summaryStatsRow: {
      flexDirection: "row",
      gap: scale(10),
    },
    summaryPill: {
      flex: 1,
      backgroundColor: palette.cardMuted,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderRadius: scale(14),
      paddingVertical: verticalScale(10),
      alignItems: "center",
      gap: verticalScale(4),
    },
    summaryPillLabel: {
      color: palette.textMuted,
      fontSize: moderateScale(11),
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    summaryPillValue: {
      color: palette.textPrimary,
      fontSize: moderateScale(17),
      fontWeight: "900",
    },
    metaText: {
      color: palette.textMuted,
      fontSize: moderateScale(12),
      lineHeight: moderateScale(18),
    },
    personalityCard: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderRadius: scale(20),
      padding: scale(16),
      gap: verticalScale(14),
    },
    personalityHeader: {
      gap: verticalScale(12),
    },
    personalityTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
    },
    personalityTitle: {
      color: palette.textPrimary,
      fontSize: moderateScale(18),
      fontWeight: "900",
      textTransform: "capitalize",
    },
    personalityBody: {
      marginTop: verticalScale(6),
      color: palette.textSecondary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(19),
    },
    signalBadge: {
      alignSelf: "flex-start",
      borderRadius: scale(999),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(6),
    },
    signalBadgeText: {
      fontSize: moderateScale(11),
      fontWeight: "900",
      letterSpacing: 0.2,
    },
    probabilityWrap: {
      gap: verticalScale(10),
    },
    detailGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(10),
    },
    detailPill: {
      width: "47%",
      backgroundColor: palette.cardMuted,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderRadius: scale(14),
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(10),
      gap: verticalScale(4),
    },
    detailLabel: {
      color: palette.textMuted,
      fontSize: moderateScale(11),
      fontWeight: "700",
    },
    detailValue: {
      color: palette.textPrimary,
      fontSize: moderateScale(14),
      fontWeight: "900",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
    },
    infoText: {
      color: palette.textSecondary,
      fontSize: moderateScale(12),
      lineHeight: moderateScale(18),
    },
  });
}
