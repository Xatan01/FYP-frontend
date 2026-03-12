import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  ChevronRight,
  LogOut,
  MoonStar,
  ShoppingBag,
  Sun,
  Users,
  Volume2,
} from "lucide-react-native";
import { moderateScale, scale, verticalScale } from "../styles/responsive";
import { useAuth } from "../context/AuthContext";
import { fetchProfileSettings, updateProfileSettings } from "../api/profile";
import { fetchStockShopCatalog, purchaseStockUnlock } from "../api/shop";

const DEFAULT_SETTINGS = {
  theme_preference: "dark",
  volume_level: 70,
  notifications_enabled: true,
  market_alerts_enabled: true,
  social_alerts_enabled: true,
  lesson_reminders_enabled: true,
};

const clampVolume = (value) => Math.min(100, Math.max(0, Number(value || 0)));

function formatPrice(price, currency) {
  const numeric = Number(price || 0);
  return `${currency || "USD"} ${numeric.toFixed(2)}`;
}

function buildPalette(isLight) {
  if (isLight) {
    return {
      background: "#f8fafc",
      card: "#ffffff",
      cardBorder: "#e2e8f0",
      cardSoft: "#eef2ff",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      textMuted: "#64748b",
      accent: "#2563eb",
      accentText: "#dbeafe",
      danger: "#dc2626",
      dangerBg: "#fee2e2",
      successBg: "#dcfce7",
      successText: "#166534",
      heroStart: "#dbeafe",
      heroEnd: "#eff6ff",
      heroTitle: "#1e3a8a",
      heroSub: "#334155",
    };
  }

  return {
    background: "#020617",
    card: "#0f172a",
    cardBorder: "#1e293b",
    cardSoft: "#111827",
    textPrimary: "#e2e8f0",
    textSecondary: "#cbd5e1",
    textMuted: "#94a3b8",
    accent: "#2563eb",
    accentText: "#dbeafe",
    danger: "#fca5a5",
    dangerBg: "#3f0f1b",
    successBg: "#14532d",
    successText: "#bbf7d0",
    heroStart: "#1e3a8a",
    heroEnd: "#0f172a",
    heroTitle: "#e2e8f0",
    heroSub: "#94a3b8",
  };
}

function buildStyles(palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    content: { padding: scale(18), paddingBottom: verticalScale(48) },
    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      backgroundColor: palette.background,
    },
    loadingText: { color: palette.textMuted, fontSize: moderateScale(12) },
    hero: {
      borderRadius: 20,
      padding: scale(18),
      borderWidth: 1,
      borderColor: palette.cardBorder,
      marginBottom: verticalScale(14),
    },
    heroTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: verticalScale(8),
    },
    heroEyebrow: {
      color: palette.accentText,
      fontSize: moderateScale(11),
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    heroPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      backgroundColor: palette.cardSoft,
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
    },
    heroPillText: { color: palette.textSecondary, fontSize: moderateScale(11), fontWeight: "700" },
    heroTitle: {
      color: palette.heroTitle,
      fontSize: moderateScale(24),
      fontWeight: "800",
      marginBottom: verticalScale(6),
    },
    heroSub: { color: palette.heroSub, fontSize: moderateScale(13) },
    card: {
      backgroundColor: palette.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      padding: scale(14),
      marginBottom: verticalScale(12),
    },
    shopCard: {
      borderColor: palette.accent,
      borderWidth: 1.5,
      shadowColor: palette.accent,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    shopHead: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: verticalScale(4),
    },
    shopBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.accent,
      backgroundColor: palette.cardSoft,
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
    },
    shopBadgeText: {
      color: palette.textPrimary,
      fontSize: moderateScale(10),
      fontWeight: "800",
    },
    cardTitle: {
      fontSize: moderateScale(15),
      fontWeight: "800",
      color: palette.textPrimary,
      marginBottom: verticalScale(4),
    },
    cardHint: {
      fontSize: moderateScale(11),
      color: palette.textMuted,
      marginBottom: verticalScale(10),
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: scale(8),
      paddingVertical: verticalScale(8),
      borderBottomWidth: 1,
      borderBottomColor: palette.cardBorder,
    },
    rowLast: { borderBottomWidth: 0, paddingBottom: 0 },
    rowLeft: { flex: 1 },
    rowTitle: { color: palette.textPrimary, fontSize: moderateScale(13), fontWeight: "700" },
    rowSub: { color: palette.textMuted, fontSize: moderateScale(11), marginTop: verticalScale(2) },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      backgroundColor: palette.cardSoft,
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(8),
    },
    actionText: { color: palette.textPrimary, fontSize: moderateScale(12), fontWeight: "700" },
    primaryBtn: {
      borderRadius: 10,
      backgroundColor: palette.accent,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(8),
      minWidth: scale(84),
      alignItems: "center",
    },
    primaryText: { color: palette.accentText, fontSize: moderateScale(11), fontWeight: "800" },
    signOutBtn: {
      borderRadius: 10,
      backgroundColor: palette.dangerBg,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(8),
    },
    volumeRow: { flexDirection: "row", alignItems: "center", gap: scale(8) },
    volumeBtn: {
      width: scale(28),
      height: scale(28),
      borderRadius: scale(14),
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: palette.cardBorder,
      backgroundColor: palette.cardSoft,
    },
    volumeBtnText: { color: palette.textPrimary, fontWeight: "800" },
    volumeBarWrap: {
      flex: 1,
      height: verticalScale(8),
      borderRadius: 999,
      backgroundColor: palette.cardSoft,
      overflow: "hidden",
    },
    volumeBarFill: { height: "100%", borderRadius: 999, backgroundColor: palette.accent },
    statusCard: {
      backgroundColor: palette.successBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      padding: scale(10),
      marginBottom: verticalScale(10),
    },
    statusText: { color: palette.successText, fontSize: moderateScale(12) },
    errorCard: {
      backgroundColor: palette.dangerBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      padding: scale(10),
      marginBottom: verticalScale(10),
    },
    errorText: { color: palette.danger, fontSize: moderateScale(12) },
    shopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: scale(8),
      paddingVertical: verticalScale(10),
      borderBottomWidth: 1,
      borderBottomColor: palette.cardBorder,
    },
    shopTag: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      backgroundColor: palette.cardSoft,
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(3),
      alignSelf: "flex-start",
      marginTop: verticalScale(4),
    },
    shopTagText: { color: palette.textMuted, fontSize: moderateScale(10), fontWeight: "700" },
    unlockedTag: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      backgroundColor: palette.successBg,
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
    },
    unlockedText: { color: palette.successText, fontSize: moderateScale(10), fontWeight: "800" },
    hintText: {
      color: palette.textMuted,
      fontSize: moderateScale(11),
      marginTop: verticalScale(8),
      lineHeight: moderateScale(16),
    },
  });
}

export default function Profile({
  userData,
  navigation,
  themePreference = "dark",
  onThemePreferenceChange = () => {},
}) {
  const { logout } = useAuth();
  const safeUser = userData ?? { name: "User", xp: 0, streak: 0, league: "Bronze" };
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [shopItems, setShopItems] = useState([]);

  const isLight = themePreference === "light";
  const palette = useMemo(() => buildPalette(isLight), [isLight]);
  const styles = useMemo(() => buildStyles(palette), [palette]);

  const loadData = useCallback(async () => {
    setError("");
    try {
      const [settingsRes, catalogRes] = await Promise.all([
        fetchProfileSettings(),
        fetchStockShopCatalog(),
      ]);
      const nextSettings = {
        ...DEFAULT_SETTINGS,
        ...(settingsRes || {}),
      };
      setSettings(nextSettings);
      onThemePreferenceChange(nextSettings.theme_preference === "light" ? "light" : "dark");
      setShopItems(Array.isArray(catalogRes?.items) ? catalogRes.items : []);
    } catch (err) {
      setError(err?.message || "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, [onThemePreferenceChange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveSettingsPatch = useCallback(
    async (patch) => {
      if (busy) return;
      const previous = settings;
      const optimistic = { ...settings, ...patch };
      setBusy(true);
      setError("");
      setSettings(optimistic);
      if (patch.theme_preference) {
        onThemePreferenceChange(patch.theme_preference === "light" ? "light" : "dark");
      }

      try {
        const saved = await updateProfileSettings(patch);
        const normalized = { ...DEFAULT_SETTINGS, ...(saved || {}) };
        setSettings(normalized);
        onThemePreferenceChange(normalized.theme_preference === "light" ? "light" : "dark");
      } catch (err) {
        setSettings(previous);
        onThemePreferenceChange(previous.theme_preference === "light" ? "light" : "dark");
        setError(err?.message || "Failed to save settings.");
      } finally {
        setBusy(false);
      }
    },
    [busy, onThemePreferenceChange, settings]
  );

  const purchaseItem = useCallback(
    async (item) => {
      if (busy || item?.is_unlocked) return;
      setBusy(true);
      setError("");
      setMessage("");
      try {
        await purchaseStockUnlock({
          symbol: item.symbol,
          paymentProvider: "demo_gateway",
          providerTransactionId: `shop-${item.symbol}-${Date.now()}`,
          amount: item.unlock_price,
          currency: item.currency,
          paymentStatus: "completed",
        });
        setMessage(`${item.symbol} unlocked successfully.`);
        await loadData();
      } catch (err) {
        setError(err?.message || "Failed to unlock stock.");
      } finally {
        setBusy(false);
      }
    },
    [busy, loadData]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[palette.heroStart, palette.heroEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <Text style={styles.heroEyebrow}>PROFILE</Text>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>{safeUser.league} League</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{safeUser.name}</Text>
          <Text style={styles.heroSub}>
            {safeUser.xp} XP • {safeUser.streak} day streak
          </Text>
        </LinearGradient>

        {!!message ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>{message}</Text>
          </View>
        ) : null}

        {!!error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={[styles.card, styles.shopCard]}>
          <View style={styles.shopHead}>
            <Text style={styles.cardTitle}>Stock Shop</Text>
            <View style={styles.shopBadge}>
              <ShoppingBag size={12} color={palette.textPrimary} />
              <Text style={styles.shopBadgeText}>Featured</Text>
            </View>
          </View>
          <Text style={styles.cardHint}>
            Purchased stocks become unlocked in Virtual Market.
          </Text>

          {shopItems.map((item, index) => {
            const last = index === shopItems.length - 1;
            return (
              <View key={item.stock_id} style={[styles.shopRow, last ? styles.rowLast : null]}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowTitle}>
                    {item.symbol} - {item.name}
                  </Text>
                  <View style={styles.shopTag}>
                    <Text style={styles.shopTagText}>{formatPrice(item.unlock_price, item.currency)}</Text>
                  </View>
                </View>
                {item.is_unlocked ? (
                  <View style={styles.unlockedTag}>
                    <Text style={styles.unlockedText}>Unlocked</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    disabled={busy}
                    onPress={() =>
                      Alert.alert(
                        "Confirm purchase",
                        `Unlock ${item.symbol} for ${formatPrice(item.unlock_price, item.currency)}?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Buy", onPress: () => purchaseItem(item) },
                        ]
                      )
                    }
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: scale(4) }}>
                      <ShoppingBag size={12} color={palette.accentText} />
                      <Text style={styles.primaryText}>Buy</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {!shopItems.length ? (
            <View style={[styles.row, styles.rowLast]}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowTitle}>No stocks available</Text>
                <Text style={styles.rowSub}>The catalog will appear after backend stock setup.</Text>
              </View>
              <Bell size={14} color={palette.textMuted} />
            </View>
          ) : null}
          <TouchableOpacity
            style={[styles.actionBtn, { marginTop: verticalScale(8) }]}
            onPress={() => navigation.navigate("VirtualMarket")}
          >
            <Volume2 size={14} color={palette.textPrimary} />
            <Text style={styles.actionText}>Open Virtual Market</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Manage friends</Text>
          <Text style={styles.cardHint}>Open friend requests and your circle.</Text>
          <View style={[styles.row, styles.rowLast]}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Friends</Text>
              <Text style={styles.rowSub}>View requests, search users, and manage connections.</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Friends")}>
              <Users size={14} color={palette.textPrimary} />
              <ChevronRight size={14} color={palette.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appearance</Text>
          <Text style={styles.cardHint}>Switch between light and dark mode.</Text>

          <View style={[styles.row, styles.rowLast]}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>{isLight ? "Light mode" : "Dark mode"}</Text>
              <Text style={styles.rowSub}>Applied app-wide immediately.</Text>
            </View>
            <View style={styles.actionBtn}>
              {isLight ? (
                <Sun size={14} color={palette.textPrimary} />
              ) : (
                <MoonStar size={14} color={palette.textPrimary} />
              )}
              <Switch
                value={!isLight}
                onValueChange={(enabled) =>
                  saveSettingsPatch({ theme_preference: enabled ? "dark" : "light" })
                }
                thumbColor={isLight ? "#ffffff" : "#e2e8f0"}
                trackColor={{ false: "#94a3b8", true: "#2563eb" }}
                disabled={busy}
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          <Text style={styles.cardHint}>Control volume and notification behavior.</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Volume</Text>
              <Text style={styles.rowSub}>{settings.volume_level}%</Text>
            </View>
            <View style={styles.volumeRow}>
              <TouchableOpacity
                style={styles.volumeBtn}
                disabled={busy}
                onPress={() =>
                  saveSettingsPatch({ volume_level: clampVolume(settings.volume_level - 5) })
                }
              >
                <Text style={styles.volumeBtnText}>-</Text>
              </TouchableOpacity>
              <View style={styles.volumeBarWrap}>
                <View style={[styles.volumeBarFill, { width: `${settings.volume_level}%` }]} />
              </View>
              <TouchableOpacity
                style={styles.volumeBtn}
                disabled={busy}
                onPress={() =>
                  saveSettingsPatch({ volume_level: clampVolume(settings.volume_level + 5) })
                }
              >
                <Text style={styles.volumeBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Notifications</Text>
              <Text style={styles.rowSub}>Master switch for all app notifications.</Text>
            </View>
            <Switch
              value={!!settings.notifications_enabled}
              onValueChange={(value) => saveSettingsPatch({ notifications_enabled: value })}
              thumbColor={isLight ? "#ffffff" : "#e2e8f0"}
              trackColor={{ false: "#94a3b8", true: "#2563eb" }}
              disabled={busy}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Market alerts</Text>
              <Text style={styles.rowSub}>Price movement and stock updates.</Text>
            </View>
            <Switch
              value={!!settings.market_alerts_enabled}
              onValueChange={(value) => saveSettingsPatch({ market_alerts_enabled: value })}
              thumbColor={isLight ? "#ffffff" : "#e2e8f0"}
              trackColor={{ false: "#94a3b8", true: "#2563eb" }}
              disabled={busy || !settings.notifications_enabled}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Social alerts</Text>
              <Text style={styles.rowSub}>Friend requests and social activity.</Text>
            </View>
            <Switch
              value={!!settings.social_alerts_enabled}
              onValueChange={(value) => saveSettingsPatch({ social_alerts_enabled: value })}
              thumbColor={isLight ? "#ffffff" : "#e2e8f0"}
              trackColor={{ false: "#94a3b8", true: "#2563eb" }}
              disabled={busy || !settings.notifications_enabled}
            />
          </View>

          <View style={[styles.row, styles.rowLast]}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Lesson reminders</Text>
              <Text style={styles.rowSub}>Keep your learning streak active.</Text>
            </View>
            <Switch
              value={!!settings.lesson_reminders_enabled}
              onValueChange={(value) => saveSettingsPatch({ lesson_reminders_enabled: value })}
              thumbColor={isLight ? "#ffffff" : "#e2e8f0"}
              trackColor={{ false: "#94a3b8", true: "#2563eb" }}
              disabled={busy || !settings.notifications_enabled}
            />
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign out</Text>
          <Text style={styles.cardHint}>End your current session on this device.</Text>
          <View style={[styles.row, styles.rowLast]}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Session</Text>
              <Text style={styles.rowSub}>You can sign in again anytime.</Text>
            </View>
            <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
              <LogOut size={14} color={palette.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

