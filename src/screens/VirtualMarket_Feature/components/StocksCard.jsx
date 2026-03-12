import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../styles/responsive";
import { formatDate, formatMoney } from "../virtualMarketUtils";

export default function StocksCard({ stocks }) {
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
    marginBottom: verticalScale(10),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
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
    color: "#f8fafc",
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
    borderColor: "#15803d",
    backgroundColor: "#052e16",
  },
  badgeLocked: {
    borderColor: "#6b7280",
    backgroundColor: "#111827",
  },
  badgeText: {
    color: "#cbd5e1",
    fontSize: moderateScale(10),
    fontWeight: "700",
  },
  name: {
    color: "#94a3b8",
    fontSize: moderateScale(11),
  },
  right: {
    alignItems: "flex-end",
  },
  price: {
    color: "#e2e8f0",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  date: {
    color: "#64748b",
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: moderateScale(12),
    textAlign: "center",
    paddingVertical: verticalScale(8),
  },
});
