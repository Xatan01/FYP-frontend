import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../styles/responsive";
import { formatMoney, formatQuantity } from "../virtualMarketUtils";
import { useAppTheme } from "../../../context/ThemeContext";

function StatItem({ label, value, color, styles }) {
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
  const { palette, isLight } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette, isLight), [palette, isLight]);
  const positions = Array.isArray(portfolio?.positions) ? portfolio.positions : [];
  const unrealized = Number(portfolio?.total_unrealized_pnl);
  const unrealizedPct = Number(portfolio?.total_unrealized_pnl_percent);
  const pnlColor = unrealized < 0 ? palette.dangerSoftText : palette.successSoftText;

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
        <StatItem label="Cash" value={formatMoney(portfolio?.cash_balance)} color={palette.textPrimary} styles={styles} />
        <StatItem label="Market Value" value={formatMoney(portfolio?.total_market_value)} color={palette.textPrimary} styles={styles} />
      </View>
      <View style={styles.statsRow}>
        <StatItem label="Total Equity" value={formatMoney(portfolio?.total_equity)} color={palette.textPrimary} styles={styles} />
        <StatItem label="Unrealized P/L" value={formatMoney(unrealized)} color={pnlColor} styles={styles} />
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
                Avg {formatMoney(position.avg_cost)} | Last {formatMoney(position.current_price)}
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

function buildStyles(palette, isLight) {
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
    color: palette.textPrimary,
    fontSize: moderateScale(10),
    fontWeight: "800",
  },
  badgePositive: {
    borderColor: palette.success,
    backgroundColor: palette.successSoft,
  },
  badgeNegative: {
    borderColor: palette.danger,
    backgroundColor: palette.dangerSoft,
  },
  badgeNeutral: {
    borderColor: palette.inputBorder,
    backgroundColor: palette.cardMuted,
  },
  statsRow: {
    flexDirection: "row",
    gap: scale(10),
    marginBottom: verticalScale(10),
  },
  statItem: {
    flex: 1,
    backgroundColor: palette.input,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 12,
    padding: scale(10),
  },
  statLabel: {
    color: palette.textMuted,
    fontSize: moderateScale(11),
    marginBottom: verticalScale(4),
  },
  statValue: {
    color: palette.textPrimary,
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  positionsTitle: {
    color: palette.accentSoftText,
    fontSize: moderateScale(12),
    fontWeight: "700",
    marginBottom: verticalScale(8),
    marginTop: verticalScale(2),
  },
  positionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: palette.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.cardBorder,
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
    color: palette.textPrimary,
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  positionName: {
    color: palette.textMuted,
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  positionMeta: {
    color: palette.textMuted,
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
  },
  positionQty: {
    color: palette.textSecondary,
    fontSize: moderateScale(11),
  },
  positionValue: {
    color: palette.textPrimary,
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
    color: isLight ? palette.successSoftText : "#16a34a",
  },
  negative: {
    color: isLight ? palette.dangerSoftText : "#ef4444",
  },
  neutral: {
    color: palette.textSecondary,
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: moderateScale(12),
    textAlign: "center",
    paddingVertical: verticalScale(8),
  },
  });
}
