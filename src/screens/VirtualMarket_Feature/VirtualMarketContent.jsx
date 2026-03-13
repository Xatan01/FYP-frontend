import React, { useMemo } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale, scale, verticalScale } from "../../styles/responsive";
import OrdersCard from "./components/OrdersCard";
import PortfolioSummaryCard from "./components/PortfolioSummaryCard";
import StocksCard from "./components/StocksCard";
import TradeTicketCard from "./components/TradeTicketCard";
import { useAppTheme } from "../../context/ThemeContext";

export default function VirtualMarketContent({
  navigation,
  loading,
  error,
  refreshing,
  portfolio,
  stocks,
  orders,
  selectedSymbol,
  quantityInput,
  submitting,
  tradeMessage,
  tradeError,
  onRetry,
  onRefresh,
  onSelectSymbol,
  onQuantityChange,
  onBuy,
  onSell,
  onOpenJournal,
}) {
  const { palette, isLight } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={16} color={palette.accentSoftText} />
          <Text style={styles.backBtnText}>Back to home</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={isLight ? ["#dbeafe", "#eff6ff"] : ["#1e293b", "#0f172a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.eyebrow}>SIMULATION</Text>
          <Text style={styles.title}>Virtual Stock Market</Text>
          <Text style={styles.subtitle}>
            Practice buy and sell decisions with your unlocked stocks.
          </Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} disabled={refreshing}>
            <Text style={styles.refreshBtnText}>{refreshing ? "Refreshing..." : "Refresh Data"}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {loading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator color={palette.accent} />
            <Text style={styles.centerText}>Loading virtual market...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.centerCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && !error ? (
          <>
            <PortfolioSummaryCard portfolio={portfolio} />
            <TradeTicketCard
              stocks={stocks}
              selectedSymbol={selectedSymbol}
              quantityInput={quantityInput}
              submitting={submitting}
              tradeMessage={tradeMessage}
              tradeError={tradeError}
              onSelectSymbol={onSelectSymbol}
              onQuantityChange={onQuantityChange}
              onBuy={onBuy}
              onSell={onSell}
              onOpenJournal={onOpenJournal}
            />
            <StocksCard stocks={stocks} />
            <OrdersCard orders={orders} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function buildStyles(palette) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  container: { padding: scale(18), paddingBottom: verticalScale(48) },
  backBtn: {
    marginBottom: verticalScale(12),
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    borderRadius: 999,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.cardBorder,
  },
  backBtnText: { color: palette.accentSoftText, fontSize: moderateScale(13), fontWeight: "700" },
  hero: {
    borderRadius: 20,
    padding: scale(18),
    borderWidth: 1,
    borderColor: palette.inputBorder,
    marginBottom: verticalScale(14),
  },
  eyebrow: {
    color: palette.accentSoftText,
    fontSize: moderateScale(11),
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: verticalScale(6),
  },
  title: {
    color: palette.textPrimary,
    fontSize: moderateScale(24),
    fontWeight: "800",
    marginBottom: verticalScale(6),
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: moderateScale(13),
    marginBottom: verticalScale(12),
  },
  refreshBtn: {
    alignSelf: "flex-start",
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.accent,
    borderRadius: 10,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
  },
  refreshBtnText: {
    color: palette.accentSoftText,
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  centerCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    padding: scale(14),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(12),
  },
  centerText: {
    color: palette.textSecondary,
    fontSize: moderateScale(13),
    marginTop: verticalScale(8),
    textAlign: "center",
  },
  errorText: {
    color: palette.dangerSoftText,
    fontSize: moderateScale(13),
    textAlign: "center",
  },
  retryBtn: {
    marginTop: verticalScale(10),
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.accent,
    borderRadius: 10,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
  },
  retryText: {
    color: palette.accentSoftText,
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  });
}
