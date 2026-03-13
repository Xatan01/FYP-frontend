import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../styles/responsive";
import { formatDate, formatMoney } from "../virtualMarketUtils";
import { useAppTheme } from "../../../context/ThemeContext";

export default function StocksCard({ stocks }) {
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const items = Array.isArray(stocks) ? stocks : [];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Market Universe</Text>
      {items.length ? (
        items.map((stock) => (
          <View key={stock.stock_id} style={styles.row}>
            <View style={styles.left}>
              <View style={styles.rowTop}>
                <Text style={styles.symbol}>{stock.symbol}</Text>
                <View
                  style={[
                    styles.badge,
                    stock.is_unlocked ? styles.badgeUnlocked : styles.badgeLocked,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {stock.is_unlocked ? "Unlocked" : "Locked"}
                  </Text>
                </View>
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {stock.name}
              </Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.price}>{formatMoney(stock.latest_price)}</Text>
              <Text style={styles.date}>{formatDate(stock.latest_price_date)}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No virtual market stocks available.</Text>
      )}
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
    marginBottom: verticalScale(10),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: palette.cardBorder,
    paddingVertical: verticalScale(10),
    gap: scale(10),
  },
  left: {
    flex: 1,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginBottom: verticalScale(2),
  },
  symbol: {
    color: palette.textPrimary,
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
  },
  badgeUnlocked: {
    borderColor: palette.success,
    backgroundColor: palette.successSoft,
  },
  badgeLocked: {
    borderColor: palette.inputBorder,
    backgroundColor: palette.input,
  },
  badgeText: {
    color: palette.textPrimary,
    fontSize: moderateScale(10),
    fontWeight: "700",
  },
  name: {
    color: palette.textMuted,
    fontSize: moderateScale(11),
  },
  right: {
    alignItems: "flex-end",
  },
  price: {
    color: palette.textPrimary,
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  date: {
    color: palette.textMuted,
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: moderateScale(12),
    textAlign: "center",
    paddingVertical: verticalScale(8),
  },
  });
}
