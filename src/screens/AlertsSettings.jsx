import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Switch,
  StyleSheet,
} from "react-native";
import { Bell, Filter, Flame } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

export default function AlertsSettings() {
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(true);
  const [marketOpenAlerts, setMarketOpenAlerts] = useState(false);
  const [highVolAlerts, setHighVolAlerts] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Alerts and Notifications</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Bell size={18} color="#2563eb" />
              <View>
                <Text style={styles.label}>Price Alerts</Text>
                <Text style={styles.subLabel}>Moves beyond your targets</Text>
              </View>
            </View>
            <Switch value={priceAlerts} onValueChange={setPriceAlerts} />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Filter size={18} color="#0ea5e9" />
              <View>
                <Text style={styles.label}>News Alerts</Text>
                <Text style={styles.subLabel}>Company and sector updates</Text>
              </View>
            </View>
            <Switch value={newsAlerts} onValueChange={setNewsAlerts} />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Flame size={18} color="#f59e0b" />
              <View>
                <Text style={styles.label}>Market Open</Text>
                <Text style={styles.subLabel}>Daily open and close prompts</Text>
              </View>
            </View>
            <Switch value={marketOpenAlerts} onValueChange={setMarketOpenAlerts} />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Bell size={18} color="#16a34a" />
              <View>
                <Text style={styles.label}>High Volatility</Text>
                <Text style={styles.subLabel}>Unusual movements in watchlist</Text>
              </View>
            </View>
            <Switch value={highVolAlerts} onValueChange={setHighVolAlerts} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(14),
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: scale(10) },
  label: { fontSize: moderateScale(14), fontWeight: "600", color: "#0f172a" },
  subLabel: { fontSize: moderateScale(11), color: "#64748b" },
});
