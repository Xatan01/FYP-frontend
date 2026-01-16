import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
} from "../styles/responsive";
import usePersistedState from "../hooks/usePersistedState";

// Your original mock data
const initialWatchlist = [
  { id: "AAPL", symbol: "AAPL", name: "Apple Inc.", price: "$190.25", change: "+1.2%", alert: true },
  { id: "TSLA", symbol: "TSLA", name: "Tesla", price: "$252.70", change: "-0.8%", alert: false },
  { id: "DBS", symbol: "DBS", name: "DBS Bank", price: "$35.40", change: "+0.4%", alert: true },
];

export default function Watchlist({ navigation }) {
  const {
    value: watchlist,
    setValue: setWatchlist,
    loading,
    error,
  } = usePersistedState("watchlist", initialWatchlist);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!symbol.trim() || !name.trim()) return;
    const id = symbol.trim().toUpperCase();
    if (watchlist.some((item) => item.id === id)) return;
    setWatchlist([
      { id, symbol: id, name: name.trim(), price: "$0.00", change: "+0.0%", alert: false },
      ...watchlist,
    ]);
    setSymbol("");
    setName("");
  };

  const handleRemove = (id) => {
    setWatchlist(watchlist.filter((item) => item.id !== id));
  };

  const toggleAlert = (id) => {
    setWatchlist(
      watchlist.map((item) =>
        item.id === id ? { ...item, alert: !item.alert } : item
      )
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading watchlist...</Text>
        </View>
      ) : (
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Your Watchlist</Text>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#2563eb" }]}
            onPress={() => navigation.navigate("Charting")}
          >
            <Text style={styles.actionText}>Open Charting</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#16a34a" }]}
            onPress={() => navigation.navigate("MarketTrends")}
          >
            <Text style={styles.actionText}>Market Trends</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.addCard}>
          <TextInput
            style={styles.addInput}
            placeholder="Symbol"
            placeholderTextColor="#94a3b8"
            value={symbol}
            onChangeText={setSymbol}
            autoCapitalize="characters"
          />
          <TextInput
            style={styles.addInput}
            placeholder="Company name"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>Add to Watchlist</Text>
          </TouchableOpacity>
        </View>
        {watchlist.map((s) => (
          <TouchableOpacity key={s.id} style={styles.card}>
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
              <View style={styles.alertRow}>
                <Text style={styles.alertLabel}>Alert</Text>
                <Switch
                  value={s.alert}
                  onValueChange={() => toggleAlert(s.id)}
                />
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(s.id)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        {watchlist.length === 0 && (
          <Text style={styles.emptyState}>No symbols yet. Add one above.</Text>
        )}
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Your original styles, with minor tweaks
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
  },
  loadingText: { color: "#64748b", fontSize: moderateScale(12) },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: verticalScale(12),
  },
  error: {
    color: "#dc2626",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  actionRow: {
    flexDirection: "row",
    gap: scale(10),
    marginBottom: verticalScale(12),
  },
  actionButton: {
    flex: 1,
    borderRadius: scale(12),
    paddingVertical: verticalScale(10),
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
  addCard: {
    backgroundColor: "#f8fafc",
    borderRadius: scale(16),
    padding: scale(12),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: verticalScale(12),
  },
  addInput: {
    backgroundColor: "#fff",
    borderRadius: scale(12),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(10),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: verticalScale(8),
    fontSize: moderateScale(12),
    color: "#0f172a",
  },
  addButton: {
    backgroundColor: "#2563eb",
    borderRadius: scale(12),
    paddingVertical: verticalScale(10),
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "600",
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
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginTop: verticalScale(6),
  },
  alertLabel: { fontSize: moderateScale(11), color: "#64748b" },
  removeButton: {
    marginTop: verticalScale(6),
    backgroundColor: "#fee2e2",
    borderRadius: scale(8),
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(8),
  },
  removeText: { color: "#dc2626", fontSize: moderateScale(11), fontWeight: "600" },
  emptyState: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: moderateScale(12),
    marginTop: verticalScale(12),
  },
});
