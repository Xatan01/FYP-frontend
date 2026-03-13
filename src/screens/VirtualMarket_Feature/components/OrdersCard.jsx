import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../styles/responsive";
import { formatDate, formatMoney, formatQuantity } from "../virtualMarketUtils";
import { useAppTheme } from "../../../context/ThemeContext";

export default function OrdersCard({ orders }) {
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const items = Array.isArray(orders) ? orders : [];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Order History</Text>
      {items.length ? (
        items.map((order) => {
          const isBuy = String(order.side).toLowerCase() === "buy";
          return (
            <View key={order.order_id} style={styles.row}>
              <View style={styles.left}>
                <View style={styles.rowTop}>
                  <View style={[styles.sideTag, isBuy ? styles.buyTag : styles.sellTag]}>
                    <Text style={styles.sideTagText}>{isBuy ? "BUY" : "SELL"}</Text>
                  </View>
                  <Text style={styles.symbol}>{order.symbol}</Text>
                </View>
                <Text style={styles.meta}>
                  Qty {formatQuantity(order.quantity)} at {formatMoney(order.unit_price)}
                </Text>
                <Text style={styles.date}>{formatDate(order.created_at)}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.netAmount}>{formatMoney(order.net_amount)}</Text>
                {order.realized_pnl !== null && order.realized_pnl !== undefined ? (
                  <Text
                    style={[
                      styles.pnl,
                      Number(order.realized_pnl) < 0 ? styles.negative : styles.positive,
                    ]}
                  >
                    P/L {formatMoney(order.realized_pnl)}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })
      ) : (
        <Text style={styles.emptyText}>No trades executed yet.</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: palette.cardBorder,
    paddingVertical: verticalScale(10),
    gap: scale(8),
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
  sideTag: {
    borderRadius: 6,
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
  },
  buyTag: {
    backgroundColor: palette.successSoft,
    borderWidth: 1,
    borderColor: palette.success,
  },
  sellTag: {
    backgroundColor: palette.dangerSoft,
    borderWidth: 1,
    borderColor: palette.danger,
  },
  sideTagText: {
    color: palette.textPrimary,
    fontSize: moderateScale(9),
    fontWeight: "800",
  },
  symbol: {
    color: palette.textPrimary,
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  meta: {
    color: palette.textMuted,
    fontSize: moderateScale(11),
  },
  date: {
    color: palette.textMuted,
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
  },
  right: {
    alignItems: "flex-end",
  },
  netAmount: {
    color: palette.textPrimary,
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  pnl: {
    marginTop: verticalScale(2),
    fontSize: moderateScale(10),
    fontWeight: "700",
  },
  positive: {
    color: palette.successSoftText,
  },
  negative: {
    color: palette.dangerSoftText,
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: moderateScale(12),
    textAlign: "center",
    paddingVertical: verticalScale(8),
  },
  });
}
