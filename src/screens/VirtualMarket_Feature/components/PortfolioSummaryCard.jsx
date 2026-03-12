import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../styles/responsive";
import { formatMoney, formatQuantity } from "../virtualMarketUtils";

function StatItem({ label, value, color = "#e2e8f0" }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function formatSignedMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "$--";
  const absFormatted = formatMoney(Math.abs(amount));
  if (amount > 0) return `+${absFormatted}`;
  if (amount < 0) return `-${absFormatted}`;
  return absFormatted;
}

export default function PortfolioSummaryCard({ portfolio }) {
  const positions = Array.isArray(portfolio?.positions) ? portfolio.positions : [];
  const unrealized = Number(portfolio?.total_unrealized_pnl);
  const unrealizedPct = Number(portfolio?.total_unrealized_pnl_percent);
  const pnlColor = unrealized < 0 ? "#fca5a5" : "#86efac";

  const pctText = Number.isFinite(unrealizedPct)
    ? `${unrealizedPct > 0 ? "+" : ""}${unrealizedPct.toFixed(2)}% overall`
    : "--";
  const pctStyle =
    unrealizedPct < 0 ? styles.badgeNegative : unrealizedPct > 0 ? styles.badgePositive : styles.badgeNeutral;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Portfolio Summary</Text>
        <View style={[styles.headerBadge, pctStyle]}>
          <Text style={styles.headerBadgeText}>{pctText}</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <StatItem label="Cash" value={formatMoney(portfolio?.cash_balance)} />
        <StatItem label="Market Value" value={formatMoney(portfolio?.total_market_value)} />
      </View>
      <View style={styles.statsRow}>
        <StatItem label="Total Equity" value={formatMoney(portfolio?.total_equity)} />
        <StatItem label="Unrealized P/L" value={formatMoney(unrealized)} color={pnlColor} />
      </View>

      <Text style={styles.positionsTitle}>Open Positions</Text>
      {positions.length ? (
        positions.map((position) => (
          <View key={`${position.stock_id}-${position.symbol}`} style={styles.positionRow}>
            <View style={styles.positionLeft}>
              <Text style={styles.positionSymbol}>{position.symbol}</Text>
              <Text style={styles.positionName} numberOfLines={1}>
                {position.name}
              </Text>
              <Text style={styles.positionMeta}>
                Avg {formatMoney(position.avg_cost)} • Last {formatMoney(position.current_price)}
              </Text>
            </View>
            <View style={styles.positionRight}>
              <Text style={styles.positionQty}>Qty {formatQuantity(position.quantity)}</Text>
              <Text style={styles.positionValue}>{formatMoney(position.current_value)}</Text>
              <Text
                style={[
                  styles.positionPnl,
                  Number(position.profit_loss ?? position.unrealized_pnl) < 0
                    ? styles.negative
                    : Number(position.profit_loss ?? position.unrealized_pnl) > 0
                    ? styles.positive
                    : styles.neutral,
                ]}
              >
                P/L {formatSignedMoney(position.profit_loss ?? position.unrealized_pnl)}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No open positions yet.</Text>
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
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(10),
    gap: scale(8),
  },
  headerBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: scale(9),
    paddingVertical: verticalScale(3),
  },
  headerBadgeText: {
    color: "#e2e8f0",
    fontSize: moderateScale(10),
    fontWeight: "800",
  },
  badgePositive: {
    borderColor: "#166534",
    backgroundColor: "#052e16",
  },
  badgeNegative: {
    borderColor: "#991b1b",
    backgroundColor: "#450a0a",
  },
  badgeNeutral: {
    borderColor: "#334155",
    backgroundColor: "#111827",
  },
  statsRow: {
    flexDirection: "row",
    gap: scale(10),
    marginBottom: verticalScale(10),
  },
  statItem: {
    flex: 1,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 12,
    padding: scale(10),
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: moderateScale(11),
    marginBottom: verticalScale(4),
  },
  statValue: {
    color: "#e2e8f0",
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  positionsTitle: {
    color: "#93c5fd",
    fontSize: moderateScale(12),
    fontWeight: "700",
    marginBottom: verticalScale(8),
    marginTop: verticalScale(2),
  },
  positionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(10),
    marginBottom: verticalScale(8),
    gap: scale(8),
  },
  positionLeft: {
    flex: 1,
  },
  positionRight: {
    alignItems: "flex-end",
  },
  positionSymbol: {
    color: "#e2e8f0",
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  positionName: {
    color: "#94a3b8",
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  positionMeta: {
    color: "#64748b",
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
  },
  positionQty: {
    color: "#cbd5e1",
    fontSize: moderateScale(11),
  },
  positionValue: {
    color: "#f8fafc",
    fontSize: moderateScale(12),
    fontWeight: "700",
    marginTop: verticalScale(2),
  },
  positionPnl: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    marginTop: verticalScale(2),
  },
  positive: {
    color: "#86efac",
  },
  negative: {
    color: "#fca5a5",
  },
  neutral: {
    color: "#cbd5e1",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: moderateScale(12),
    textAlign: "center",
    paddingVertical: verticalScale(8),
  },
});
