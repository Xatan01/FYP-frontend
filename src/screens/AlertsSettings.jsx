import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Bell, Filter, Flame } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import usePersistedState from "../hooks/usePersistedState";

export default function AlertsSettings() {
  const {
    value: settings,
    setValue: setSettings,
    loading,
    error,
  } = usePersistedState("alertSettings", {
    priceAlerts: true,
    newsAlerts: true,
    marketOpenAlerts: false,
    highVolAlerts: true,
    notificationsEnabled: false,
  });

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEnableNotifications = () => {
    setSettings((prev) => ({ ...prev, notificationsEnabled: true }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ padding: scale(16) }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Alerts and Notifications</Text>
          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Notifications</Text>
            <Text style={styles.noticeText}>
              Enable system notifications to receive alerts.
            </Text>
            <TouchableOpacity
              style={styles.enableButton}
              onPress={handleEnableNotifications}
            >
              <Text style={styles.enableText}>
                {settings.notificationsEnabled ? "Enabled" : "Enable Notifications"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Bell size={18} color="#2563eb" />
                <View>
                  <Text style={styles.label}>Price Alerts</Text>
                  <Text style={styles.subLabel}>Moves beyond your targets</Text>
                </View>
              </View>
              <Switch
                value={settings.priceAlerts}
                onValueChange={() => toggle("priceAlerts")}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Filter size={18} color="#0ea5e9" />
                <View>
                  <Text style={styles.label}>News Alerts</Text>
                  <Text style={styles.subLabel}>Company and sector updates</Text>
                </View>
              </View>
              <Switch
                value={settings.newsAlerts}
                onValueChange={() => toggle("newsAlerts")}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Flame size={18} color="#f59e0b" />
                <View>
                  <Text style={styles.label}>Market Open</Text>
                  <Text style={styles.subLabel}>Daily open and close prompts</Text>
                </View>
              </View>
              <Switch
                value={settings.marketOpenAlerts}
                onValueChange={() => toggle("marketOpenAlerts")}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Bell size={18} color="#16a34a" />
                <View>
                  <Text style={styles.label}>High Volatility</Text>
                  <Text style={styles.subLabel}>Unusual movements in watchlist</Text>
                </View>
              </View>
              <Switch
                value={settings.highVolAlerts}
                onValueChange={() => toggle("highVolAlerts")}
              />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

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
    marginBottom: verticalScale(10),
  },
  noticeCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: scale(14),
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginBottom: verticalScale(12),
  },
  noticeTitle: { fontSize: moderateScale(14), fontWeight: "700", color: "#1e3a8a" },
  noticeText: { fontSize: moderateScale(12), color: "#1e40af", marginTop: 4 },
  enableButton: {
    marginTop: verticalScale(10),
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: verticalScale(8),
    alignItems: "center",
  },
  enableText: { color: "#fff", fontSize: moderateScale(12), fontWeight: "600" },
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
