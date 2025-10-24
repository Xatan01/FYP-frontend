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

export default function Learn() {
  const modules = [
    { title: "Introduction to Stocks", progress: 0.8 },
    { title: "Understanding REITs", progress: 0.45 },
    { title: "ETF Basics", progress: 0.3 },
    { title: "Advanced Investing", progress: 0.1 },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Learning Modules</Text>
        {modules.map((m, i) => (
          <TouchableOpacity key={i} style={styles.card}>
            <Text style={styles.title}>{m.title}</Text>
            <View style={styles.progressBackground}>
              <View
                style={[styles.progressFill, { width: `${m.progress * 100}%` }]}
              />
            </View>
          </TouchableOpacity>
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
    backgroundColor: "#f1f5f9",
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(10),
  },
  title: { fontSize: moderateScale(14), fontWeight: "600", color: "#1e293b" },
  progressBackground: {
    height: verticalScale(8),
    backgroundColor: "#cbd5e1",
    borderRadius: scale(4),
    marginTop: verticalScale(8),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: scale(4),
  },
});
