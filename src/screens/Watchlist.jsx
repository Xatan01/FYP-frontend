import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
} from "../styles/responsive";

// Your original mock data
const watchlist = [
  { symbol: "AAPL", name: "Apple Inc.", price: "$190.25", change: "+1.2%" },
  { symbol: "TSLA", name: "Tesla", price: "$252.70", change: "-0.8%" },
  { symbol: "DBS", name: "DBS Bank", price: "$35.40", change: "+0.4%" },
];

export default function Watchlist() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Your Watchlist</Text>
        {watchlist.map((s, i) => (
          <TouchableOpacity key={i} style={styles.card}>
            <View>
              <Text style={styles.symbol}>{s.symbol}</Text>
              <Text style={styles.name}>{s.name}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.price}>{s.price}</Text>
              <Text
                style={[
                  styles.change,
                  s.change.startsWith("+")
                    ? { color: "#16a34a" }
                    : { color: "#dc2626" },
                ]}
              >
                {s.change}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Your original styles, with minor tweaks
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: verticalScale(12),
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc", // Lighter background
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  symbol: { fontSize: moderateScale(15), fontWeight: "600", color: "#0f172a" },
  name: { fontSize: moderateScale(12), color: "#475569", marginTop: 2 },
  right: { alignItems: "flex-end" },
  price: { fontSize: moderateScale(14), fontWeight: "600", color: "#0f172a" },
  change: { fontSize: moderateScale(12), fontWeight: "500" },
});