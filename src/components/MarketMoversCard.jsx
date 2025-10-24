import { View, Text, ScrollView, StyleSheet } from "react-native";
import { TrendingUp, TrendingDown } from "lucide-react-native";

const defaultMovers = [
  { symbol: "DBS", name: "DBS Group Holdings", price: "$35.20", change: 2.4 },
  { symbol: "OCBC", name: "OCBC Bank", price: "$13.85", change: 1.8 },
  { symbol: "UOB", name: "United Overseas Bank", price: "$30.15", change: -0.5 },
  { symbol: "CapitaLand", name: "CapitaLand Investment", price: "$3.42", change: 3.2 },
  { symbol: "Keppel", name: "Keppel Corporation", price: "$6.78", change: -1.2 },
  { symbol: "SingTel", name: "Singapore Telecom", price: "$2.54", change: 0.8 },
];

export default function MarketMoversCard({ movers = defaultMovers }) {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Top Market Movers</Text>
      <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
        {movers.map((m, i) => {
          const isPositive = m.change >= 0;
          const trendColor = isPositive ? "#16a34a" : "#dc2626";
          return (
            <View key={m.symbol} style={[styles.rowBetween, styles.rowItem]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.symbol}>{m.symbol}</Text>
                <Text style={styles.name} numberOfLines={1}>{m.name}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.price}>{m.price}</Text>
                <View style={styles.row}>
                  {isPositive ? (
                    <TrendingUp color={trendColor} size={12} />
                  ) : (
                    <TrendingDown color={trendColor} size={12} />
                  )}
                  <Text style={[styles.change, { color: trendColor }]}>
                    {isPositive ? "+" : ""}
                    {m.change}%
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  header: { fontSize: 12, fontWeight: "500", color: "#64748b", marginBottom: 8 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  row: { flexDirection: "row", alignItems: "center" },
  symbol: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  name: { fontSize: 12, color: "#64748b" },
  price: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  change: { fontSize: 12, fontWeight: "500", marginLeft: 4 },
});
