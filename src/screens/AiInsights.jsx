import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
} from "../styles/responsive";

export default function AiInsights() {
  const predictions = [
    { asset: "DBS Group Holdings", signal: "Bullish", confidence: 0.84 },
    { asset: "CapitaLand REIT", signal: "Neutral", confidence: 0.63 },
    { asset: "Keppel Corp", signal: "Bearish", confidence: 0.77 },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>AI Market Insights</Text>
        {predictions.map((p, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.asset}>{p.asset}</Text>
            <Text
              style={[
                styles.signal,
                p.signal === "Bullish"
                  ? { color: "#16a34a" }
                  : p.signal === "Bearish"
                  ? { color: "#dc2626" }
                  : { color: "#d97706" },
              ]}
            >
              {p.signal} • {Math.round(p.confidence * 100)}% confidence
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  header: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: verticalScale(12),
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: scale(16),
    marginBottom: verticalScale(10),
  },
  asset: { fontSize: moderateScale(14), fontWeight: "600", color: "#0f172a" },
  signal: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    marginTop: verticalScale(4),
  },
});
