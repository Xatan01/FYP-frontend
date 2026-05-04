import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const DEMO_STOCKS = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    benchmarkTicker: "SPY",
    benchmarkLastDate: "2026-05-03",
    regimeLabel: "bull",
    marketRegime: "Risk-on uptrend",
    regimeNote: "Mega-cap leadership is supporting broad tech strength.",
    momentum: 0.78,
    quality: 0.9,
    valuation: 0.58,
    volatility: 0.29,
    macroTailwind: 0.68,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    benchmarkTicker: "SPY",
    benchmarkLastDate: "2026-05-03",
    regimeLabel: "bull",
    marketRegime: "Constructive trend",
    regimeNote: "Cloud and AI spending keep the trend stable and high quality.",
    momentum: 0.73,
    quality: 0.92,
    valuation: 0.54,
    volatility: 0.27,
    macroTailwind: 0.7,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    benchmarkTicker: "SPY",
    benchmarkLastDate: "2026-05-03",
    regimeLabel: "bull",
    marketRegime: "High-beta momentum",
    regimeNote: "Momentum is strong, but volatility stays elevated.",
    momentum: 0.88,
    quality: 0.82,
    valuation: 0.44,
    volatility: 0.48,
    macroTailwind: 0.74,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    benchmarkTicker: "SPY",
    benchmarkLastDate: "2026-05-03",
    regimeLabel: "bull",
    marketRegime: "Balanced growth",
    regimeNote: "Advertising resilience and AI optionality keep the setup constructive.",
    momentum: 0.67,
    quality: 0.85,
    valuation: 0.63,
    volatility: 0.31,
    macroTailwind: 0.64,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    benchmarkTicker: "SPY",
    benchmarkLastDate: "2026-05-03",
    regimeLabel: "bull",
    marketRegime: "Consumer-led recovery",
    regimeNote: "Retail durability and cloud stabilization support a bullish tilt.",
    momentum: 0.7,
    quality: 0.8,
    valuation: 0.52,
    volatility: 0.36,
    macroTailwind: 0.62,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    benchmarkTicker: "SPY",
    benchmarkLastDate: "2026-05-03",
    regimeLabel: "bear",
    marketRegime: "Headline-driven volatility",
    regimeNote: "High dispersion keeps aggressive profiles interested while conservative ones stay cautious.",
    momentum: 0.46,
    quality: 0.62,
    valuation: 0.39,
    volatility: 0.67,
    macroTailwind: 0.45,
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    benchmarkTicker: "SPY",
    benchmarkLastDate: "2026-05-03",
    regimeLabel: "hold",
    marketRegime: "Range-bound financials",
    regimeNote: "Higher-for-longer rates help margins, but risk appetite is mixed.",
    momentum: 0.55,
    quality: 0.84,
    valuation: 0.66,
    volatility: 0.24,
    macroTailwind: 0.57,
  },
];

const DEMO_STOCKS_BY_SYMBOL = DEMO_STOCKS.reduce((acc, item) => {
  acc[item.symbol] = item;
  return acc;
}, {});

const DEFAULT_TICKERS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"];

const PERSONALITY_PRESETS = [
  {
    personality: "conservative",
    description:
      "Protect capital first. Requires stronger confirmation and keeps smaller exposure when volatility rises.",
    bullThreshold: 0.62,
    bearThreshold: 0.55,
    maxAllocation: 0.12,
    targetAnnualVol: 0.1,
    maxDrawdownLimit: 0.08,
    marginThreshold: 0.07,
    kellyMultiplier: 0.45,
    bullBoost: -0.02,
    bearBoost: 0.02,
    holdBoost: 0.08,
    neutralAction: "Wait for confirmation",
  },
  {
    personality: "balanced",
    description:
      "Balances conviction and risk. Will take trend-following signals with moderate sizing and disciplined thresholds.",
    bullThreshold: 0.56,
    bearThreshold: 0.58,
    maxAllocation: 0.18,
    targetAnnualVol: 0.14,
    maxDrawdownLimit: 0.12,
    marginThreshold: 0.05,
    kellyMultiplier: 0.65,
    bullBoost: 0.02,
    bearBoost: 0,
    holdBoost: 0.02,
    neutralAction: "Scale in only on strength",
  },
  {
    personality: "aggressive",
    description:
      "Leans into momentum early. Accepts larger swings and pushes size harder when upside probability expands.",
    bullThreshold: 0.5,
    bearThreshold: 0.62,
    maxAllocation: 0.26,
    targetAnnualVol: 0.2,
    maxDrawdownLimit: 0.18,
    marginThreshold: 0.03,
    kellyMultiplier: 0.88,
    bullBoost: 0.06,
    bearBoost: -0.02,
    holdBoost: -0.02,
    neutralAction: "Probe with starter size",
  },
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, Number(value ?? 0)));
}

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
      label: "BUY",
    };
  }
  if (signal === "SELL") {
    return {
      bg: palette.dangerSoft,
      text: palette.dangerSoftText,
      label: "SELL",
    };
  }
  return {
    bg: palette.warningSoft,
    text: palette.warningSoftText,
    label: "HOLD",
  };
}

function ProbabilityBar({ label, value, fillColor, palette }) {
  return (
    <View style={stylesInline.metricBlock}>
      <View style={stylesInline.metricHeader}>
        <Text style={[stylesInline.metricLabel, { color: palette.textSecondary }]}>{label}</Text>
        <Text style={[stylesInline.metricValue, { color: palette.textPrimary }]}>{formatPercent(value)}</Text>
      </View>
      <View
        style={[
          stylesInline.metricTrack,
          { backgroundColor: palette.cardMuted, borderColor: palette.cardBorder },
        ]}
      >
        <View
          style={[
            stylesInline.metricFill,
            {
              width: `${Math.max(0, Math.min(100, Number(value ?? 0) * 100))}%`,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

function normalizeWeights(values) {
  const safeValues = values.map((value) => Math.max(0.01, Number(value ?? 0)));
  const total = safeValues.reduce((sum, value) => sum + value, 0);
  return safeValues.map((value) => value / total);
}

function buildPersonalitySignal(profile, preset) {
  const trendStrength =
    profile.momentum * 0.34 +
    profile.quality * 0.22 +
    profile.valuation * 0.12 +
    profile.macroTailwind * 0.16 +
    (1 - profile.volatility) * 0.16;

  const downsideRisk =
    (1 - profile.momentum) * 0.28 +
    profile.volatility * 0.32 +
    (1 - profile.valuation) * 0.12 +
    (1 - profile.macroTailwind) * 0.16 +
    (1 - profile.quality) * 0.12;

  const bullRaw =
    trendStrength +
    preset.bullBoost +
    (profile.regimeLabel === "bull" ? 0.04 : 0) -
    (profile.regimeLabel === "bear" ? 0.05 : 0);
  const bearRaw =
    downsideRisk +
    preset.bearBoost +
    profile.volatility * 0.08 +
    (profile.regimeLabel === "bear" ? 0.04 : 0);
  const holdRaw =
    0.18 +
    (1 - Math.abs(trendStrength - downsideRisk)) * 0.45 +
    preset.holdBoost +
    (profile.regimeLabel === "hold" ? 0.05 : 0);

  const [bullProb, holdProb, bearProb] = normalizeWeights([bullRaw, holdRaw, bearRaw]);

  let signal = "HOLD";
  if (bullProb >= preset.bullThreshold && bullProb > bearProb) signal = "BUY";
  else if (bearProb >= preset.bearThreshold && bearProb > bullProb) signal = "SELL";

  const conviction = signal === "BUY" ? bullProb : signal === "SELL" ? bearProb : holdProb;
  const sizeMultiplier = signal === "HOLD" ? 0.35 : 0.5 + conviction;
  const volatilityBrake = 1 - profile.volatility * 0.4;
  const size = clamp(preset.maxAllocation * sizeMultiplier * volatilityBrake, 0.03, preset.maxAllocation);
  const kellyFraction = clamp(conviction * preset.kellyMultiplier * (1 - profile.volatility * 0.25), 0.04, 0.95);

  return {
    personality: preset.personality,
    description: preset.description,
    signal,
    bull_prob: bullProb,
    hold_prob: holdProb,
    bear_prob: bearProb,
    size,
    bull_threshold: preset.bullThreshold,
    bear_threshold: preset.bearThreshold,
    max_allocation: preset.maxAllocation,
    target_annual_vol: preset.targetAnnualVol,
    max_drawdown_limit: preset.maxDrawdownLimit,
    margin_threshold: preset.marginThreshold,
    neutral_action: preset.neutralAction,
    kelly_fraction: kellyFraction,
    as_of_date: "2026-05-03",
  };
}

function buildDemoSignals(symbol) {
  const profile = DEMO_STOCKS_BY_SYMBOL[symbol];
  if (!profile) return null;

  return {
    ticker: profile.symbol,
    company_name: profile.name,
    benchmark_ticker: profile.benchmarkTicker,
    benchmark_last_date: profile.benchmarkLastDate,
    generated_at: new Date().toISOString(),
    model_bundle_updated_at: "2026-05-03T09:00:00Z",
    regime_label: profile.regimeLabel,
    market_regime: profile.marketRegime,
    regime_note: profile.regimeNote,
    items: PERSONALITY_PRESETS.map((preset) => buildPersonalitySignal(profile, preset)),
  };
}

function findDemoStock(query) {
  const cleaned = String(query ?? "").trim().toUpperCase();
  if (!cleaned) return null;

  return (
    DEMO_STOCKS.find(
      (item) =>
        item.symbol === cleaned || item.name.toUpperCase().includes(cleaned)
    ) || null
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
  const [searchResults, setSearchResults] = useState([]);
  const searchSeq = useRef(0);

  const loadSignals = useCallback(async (ticker, { quiet = false } = {}) => {
    const match = findDemoStock(ticker);
    const cleanTicker = match?.symbol || String(ticker || "").trim().toUpperCase();
    if (!cleanTicker) return;

    if (quiet) setRefreshing(true);
    else setLoading(true);

    try {
      setError("");
      await new Promise((resolve) => setTimeout(resolve, quiet ? 220 : 420));

      const result = buildDemoSignals(cleanTicker);
      if (!result) {
        throw new Error(`No demo signal set is available for ${cleanTicker} yet.`);
      }

      setSignals(result);
      setActiveSymbol(cleanTicker);
      setSymbolQuery(cleanTicker);
      setSearchResults([]);
      setSearching(false);
    } catch (err) {
      setSignals(null);
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
    const query = symbolQuery.trim();
    const requestId = searchSeq.current + 1;
    searchSeq.current = requestId;

    if (query.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return undefined;
    }

    const timeout = setTimeout(() => {
      const lowered = query.toLowerCase();
      setSearching(true);
      const nextResults = DEMO_STOCKS.filter(
        (item) =>
          item.symbol.toLowerCase().includes(lowered) ||
          item.name.toLowerCase().includes(lowered)
      ).slice(0, 6);

      if (requestId === searchSeq.current) {
        setSearchResults(nextResults);
        setSearching(false);
      }
    }, 180);

    return () => clearTimeout(timeout);
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

    return {
      buys,
      sells,
      holds,
      regimeLabel: signals?.market_regime || "Neutral market regime",
      regimeNote: signals?.regime_note || "",
    };
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
          <Text style={styles.heroTitle}>One stock, three trading personalities.</Text>
          <Text style={styles.heroSubtitle}>
            Search a stock or tap a quick chip, run the analysis, and compare how conservative,
            balanced, and aggressive traders respond to the same setup.
          </Text>
        </LinearGradient>

        <View style={styles.searchCard}>
          <Text style={styles.sectionEyebrow}>Select Stock</Text>
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrap}>
              <Search size={16} color={palette.textMuted} />
              <TextInput
                value={symbolQuery}
                onChangeText={setSymbolQuery}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="Search symbol or company"
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

          {searching ? <Text style={styles.helperText}>Searching local demo universe...</Text> : null}
          {!searching && searchResults.length ? (
            <View style={styles.searchResults}>
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.symbol}
                  style={styles.searchResultItem}
                  onPress={() => loadSignals(item.symbol)}
                >
                  <Text style={styles.searchResultSymbol}>{item.symbol}</Text>
                  <Text style={styles.searchResultName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
                  <View style={styles.summaryHeaderCopy}>
                    <Text style={styles.sectionEyebrow}>Summary Panel</Text>
                    <Text style={styles.summaryTitle}>{signals.ticker}</Text>
                    <Text style={styles.summaryCompany}>{signals.company_name}</Text>
                    <Text style={styles.summarySubtitle}>Market regime: {topSummary.regimeLabel}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={() => loadSignals(activeSymbol, { quiet: true })}
                    disabled={refreshing}
                  >
                    <RefreshCw size={15} color={palette.accent} />
                    <Text style={styles.refreshBtnText}>
                      {refreshing ? "Refreshing" : "Refresh"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.regimeNote}>{topSummary.regimeNote}</Text>

                <View style={styles.distributionHeader}>
                  <Text style={styles.distributionTitle}>Overall signal distribution</Text>
                  <Text style={styles.distributionSubtitle}>
                    Number of personality models currently signaling each action.
                  </Text>
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

                <Text style={styles.metaText}>Generated: {formatDateTime(signals.generated_at)}</Text>
                <Text style={styles.metaText}>
                  Latest bundle update: {formatDateTime(signals.model_bundle_updated_at)}
                </Text>
                <Text style={styles.metaText}>
                  Benchmark context: {signals.benchmark_ticker} through {signals.benchmark_last_date}
                </Text>
              </View>
            ) : null}

            {Array.isArray(signals?.items)
              ? signals.items.map((item) => {
                  const appearance = getSignalAppearance(item.signal, palette);
                  return (
                    <View key={item.personality} style={styles.personalityCard}>
                      <View style={styles.personalityHeader}>
                        <View style={styles.personalityCopy}>
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
                        <ProbabilityBar
                          label="Bull probability"
                          value={item.bull_prob}
                          fillColor={palette.success}
                          palette={palette}
                        />
                        <ProbabilityBar
                          label="Hold probability"
                          value={item.hold_prob}
                          fillColor={palette.warning}
                          palette={palette}
                        />
                        <ProbabilityBar
                          label="Bear probability"
                          value={item.bear_prob}
                          fillColor={palette.danger}
                          palette={palette}
                        />
                      </View>

                      <View style={styles.detailGrid}>
                        <View style={styles.detailPill}>
                          <Text style={styles.detailLabel}>Position size</Text>
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
                          Margin threshold {formatPercent(item.margin_threshold)}. Neutral action:{" "}
                          {item.neutral_action}.
                        </Text>
                      </View>
                      <Text style={styles.infoText}>
                        Latest signal date: {item.as_of_date}. Kelly fraction:{" "}
                        {formatPercent(item.kelly_fraction)}.
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
    sectionEyebrow: {
      color: palette.accent,
      fontSize: moderateScale(11),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.4,
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
    searchResults: {
      borderTopWidth: 1,
      borderTopColor: palette.cardBorder,
      paddingTop: verticalScale(8),
      gap: verticalScale(8),
    },
    searchResultItem: {
      backgroundColor: palette.cardMuted,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderRadius: scale(14),
      padding: scale(12),
    },
    searchResultSymbol: {
      color: palette.textPrimary,
      fontSize: moderateScale(13),
      fontWeight: "800",
    },
    searchResultName: {
      marginTop: verticalScale(3),
      color: palette.textSecondary,
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
    summaryHeaderCopy: {
      flex: 1,
    },
    summaryTitle: {
      marginTop: verticalScale(4),
      color: palette.textPrimary,
      fontSize: moderateScale(20),
      fontWeight: "900",
    },
    summaryCompany: {
      marginTop: verticalScale(2),
      color: palette.textMuted,
      fontSize: moderateScale(12),
      fontWeight: "600",
    },
    summarySubtitle: {
      marginTop: verticalScale(6),
      color: palette.textSecondary,
      fontSize: moderateScale(12),
      lineHeight: moderateScale(18),
    },
    regimeNote: {
      color: palette.textSecondary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(19),
    },
    distributionHeader: {
      gap: verticalScale(2),
    },
    distributionTitle: {
      color: palette.textPrimary,
      fontSize: moderateScale(14),
      fontWeight: "800",
    },
    distributionSubtitle: {
      color: palette.textMuted,
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: scale(12),
    },
    personalityCopy: {
      flex: 1,
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
