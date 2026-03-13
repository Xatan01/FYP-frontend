import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { NotebookPen } from "lucide-react-native";
import { moderateScale, scale, verticalScale } from "../../../styles/responsive";
import { formatMoney } from "../virtualMarketUtils";
import { useAppTheme } from "../../../context/ThemeContext";

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
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
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
          <NotebookPen size={16} color={palette.accentSoftText} />
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
          placeholderTextColor={palette.textMuted}
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

function buildStyles(palette) {
  return StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    padding: scale(14),
    marginBottom: verticalScale(12),
  },
  title: {
    color: palette.textPrimary,
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
    color: palette.textMuted,
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  journalBtn: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.inputBorder,
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
    borderColor: palette.inputBorder,
    borderRadius: 999,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    backgroundColor: palette.input,
  },
  symbolChipSelected: {
    borderColor: palette.accent,
    backgroundColor: palette.accentSoft,
  },
  symbolChipText: {
    color: palette.textSecondary,
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  symbolChipTextSelected: {
    color: palette.accentSoftText,
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: moderateScale(12),
    marginBottom: verticalScale(12),
  },
  inputWrap: {
    marginBottom: verticalScale(10),
  },
  inputLabel: {
    color: palette.textMuted,
    fontSize: moderateScale(11),
    marginBottom: verticalScale(5),
  },
  input: {
    backgroundColor: palette.input,
    borderColor: palette.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(9),
    color: palette.textPrimary,
    fontSize: moderateScale(13),
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  priceLabel: {
    color: palette.textMuted,
    fontSize: moderateScale(12),
  },
  priceValue: {
    color: palette.textPrimary,
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  tradeError: {
    color: palette.dangerSoftText,
    fontSize: moderateScale(11),
    marginBottom: verticalScale(8),
  },
  tradeMessage: {
    color: palette.successSoftText,
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
    backgroundColor: palette.successSoft,
    borderWidth: 1,
    borderColor: palette.success,
  },
  sellBtn: {
    backgroundColor: palette.dangerSoft,
    borderWidth: 1,
    borderColor: palette.danger,
  },
  actionBtnText: {
    color: palette.textPrimary,
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.55,
  },
  });
}
