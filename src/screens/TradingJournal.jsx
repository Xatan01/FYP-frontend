import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { NotebookPen, Plus } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

const entries = [
  {
    id: "t1",
    symbol: "AAPL",
    date: "2025-10-22",
    pnl: "+$120",
    note: "Followed breakout above 190, took partial profits.",
  },
  {
    id: "t2",
    symbol: "DBS",
    date: "2025-10-20",
    pnl: "-$45",
    note: "Stopped out after trend reversal.",
  },
  {
    id: "t3",
    symbol: "CIT",
    date: "2025-10-19",
    pnl: "+$80",
    note: "Held through earnings, good volume.",
  },
];

export default function TradingJournal() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Trading Journal</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={16} color="#fff" />
            <Text style={styles.addText}>Add Entry</Text>
          </TouchableOpacity>
        </View>

        {entries.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <NotebookPen size={18} color="#2563eb" />
              <Text style={styles.symbol}>{entry.symbol}</Text>
              <Text style={styles.date}>{entry.date}</Text>
              <Text
                style={[
                  styles.pnl,
                  entry.pnl.startsWith("+") ? styles.pnlUp : styles.pnlDown,
                ]}
              >
                {entry.pnl}
              </Text>
            </View>
            <Text style={styles.note}>{entry.note}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "#2563eb",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 999,
  },
  addText: { color: "#fff", fontSize: moderateScale(12), fontWeight: "600" },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(14),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(6),
  },
  symbol: { fontSize: moderateScale(14), fontWeight: "700", color: "#0f172a" },
  date: { fontSize: moderateScale(12), color: "#64748b" },
  pnl: { marginLeft: "auto", fontSize: moderateScale(12), fontWeight: "700" },
  pnlUp: { color: "#16a34a" },
  pnlDown: { color: "#dc2626" },
  note: { fontSize: moderateScale(13), color: "#334155" },
});
