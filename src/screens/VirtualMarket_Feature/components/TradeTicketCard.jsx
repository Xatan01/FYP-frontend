import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { NotebookPen } from "lucide-react-native";
import { moderateScale, scale, verticalScale } from "../../../styles/responsive";
import { formatMoney } from "../virtualMarketUtils";

export default function TradeTicketCard({
  stocks,
  selectedSymbol,
  quantityInput,
  submitting,
  tradeMessage,
  tradeError,
  onSelectSymbol,
  onQuantityChange,
  onBuy,
  onSell,
  onOpenJournal,
}) {
  const unlockedStocks = useMemo(
    () => (Array.isArray(stocks) ? stocks.filter((item) => item.is_unlocked) : []),
    [stocks]
  );
  const selectedStock = unlockedStocks.find((item) => item.symbol === selectedSymbol) || null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Trade Ticket</Text>
          <Text style={styles.subtitle}>Unlocked symbols only</Text>
        </View>
        <TouchableOpacity style={styles.journalBtn} onPress={onOpenJournal}>
          <NotebookPen size={16} color="#bfdbfe" />
        </TouchableOpacity>
      </View>

      {unlockedStocks.length ? (
        <View style={styles.symbolsWrap}>
          {unlockedStocks.map((stock) => {
            const isSelected = stock.symbol === selectedSymbol;
            return (
              <TouchableOpacity
                key={stock.symbol}
                style={[styles.symbolChip, isSelected && styles.symbolChipSelected]}
                onPress={() => onSelectSymbol(stock.symbol)}
                disabled={submitting}
              >
                <Text style={[styles.symbolChipText, isSelected && styles.symbolChipTextSelected]}>
                  {stock.symbol}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <Text style={styles.emptyText}>No unlocked symbols available for trading.</Text>
      )}

      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>Quantity</Text>
        <TextInput
          style={styles.input}
          value={quantityInput}
          onChangeText={onQuantityChange}
          placeholder="e.g. 2.5"
          placeholderTextColor="#64748b"
          keyboardType="decimal-pad"
          editable={!submitting}
        />
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Latest Price</Text>
        <Text style={styles.priceValue}>{formatMoney(selectedStock?.latest_price)}</Text>
      </View>

      {!!tradeError && <Text style={styles.tradeError}>{tradeError}</Text>}
      {!!tradeMessage && <Text style={styles.tradeMessage}>{tradeMessage}</Text>}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.buyBtn, submitting && styles.btnDisabled]}
          onPress={onBuy}
          disabled={submitting || !unlockedStocks.length}
        >
          <Text style={styles.actionBtnText}>{submitting ? "Submitting..." : "Buy"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.sellBtn, submitting && styles.btnDisabled]}
          onPress={onSell}
          disabled={submitting || !unlockedStocks.length}
        >
          <Text style={styles.actionBtnText}>{submitting ? "Submitting..." : "Sell"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: scale(14),
    marginBottom: verticalScale(12),
  },
  title: {
    color: "#e2e8f0",
    fontSize: moderateScale(16),
    fontWeight: "800",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(10),
    gap: scale(10),
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  journalBtn: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: "#1e3a8a",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  symbolsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
    marginBottom: verticalScale(12),
  },
  symbolChip: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 999,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    backgroundColor: "#111827",
  },
  symbolChipSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#1e3a8a",
  },
  symbolChipText: {
    color: "#cbd5e1",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  symbolChipTextSelected: {
    color: "#dbeafe",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(12),
  },
  inputWrap: {
    marginBottom: verticalScale(10),
  },
  inputLabel: {
    color: "#94a3b8",
    fontSize: moderateScale(11),
    marginBottom: verticalScale(5),
  },
  input: {
    backgroundColor: "#111827",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(9),
    color: "#f8fafc",
    fontSize: moderateScale(13),
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  priceLabel: {
    color: "#94a3b8",
    fontSize: moderateScale(12),
  },
  priceValue: {
    color: "#e2e8f0",
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  tradeError: {
    color: "#fca5a5",
    fontSize: moderateScale(11),
    marginBottom: verticalScale(8),
  },
  tradeMessage: {
    color: "#86efac",
    fontSize: moderateScale(11),
    marginBottom: verticalScale(8),
  },
  actions: {
    flexDirection: "row",
    gap: scale(10),
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: verticalScale(10),
  },
  buyBtn: {
    backgroundColor: "#166534",
  },
  sellBtn: {
    backgroundColor: "#991b1b",
  },
  actionBtnText: {
    color: "#f8fafc",
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.55,
  },
});
