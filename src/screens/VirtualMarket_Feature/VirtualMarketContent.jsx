import React from "react";
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
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={16} color="#bfdbfe" />
          <Text style={styles.backBtnText}>Back to home</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={["#1e293b", "#0f172a"]}
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
            <ActivityIndicator color="#7dd3fc" />
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
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
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  backBtnText: { color: "#bfdbfe", fontSize: moderateScale(13), fontWeight: "700" },
  hero: {
    borderRadius: 20,
    padding: scale(18),
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: verticalScale(14),
  },
  eyebrow: {
    color: "#7dd3fc",
    fontSize: moderateScale(11),
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: verticalScale(6),
  },
  title: {
    color: "#e2e8f0",
    fontSize: moderateScale(24),
    fontWeight: "800",
    marginBottom: verticalScale(6),
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: moderateScale(13),
    marginBottom: verticalScale(12),
  },
  refreshBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#1e3a8a",
    borderRadius: 10,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
  },
  refreshBtnText: {
    color: "#dbeafe",
    fontSize: moderateScale(12),
    fontWeight: "700",
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
