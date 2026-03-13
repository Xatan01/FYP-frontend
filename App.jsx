import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { StatusBar } from "expo-status-bar";
import { enableScreens } from "react-native-screens";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import LessonCompleteModal from "./src/components/LessonCompleteModal";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { apiFetch } from "./src/api/client";
import { fetchProfileGameSummary, fetchProfileSettings } from "./src/api/profile";
import { buildNavigationTheme } from "./src/theme/appTheme";

enableScreens();

function normalizeUser(user, fallbackEmail) {
  return {
    name: user?.name ?? user?.email ?? fallbackEmail ?? "User",
    xp: user?.xp ?? 0,
    streak: user?.streak ?? 0,
    league: user?.league ?? "Bronze",
  };
}

function AppInner() {
  const { session, loading: authLoading } = useAuth();

  const [userData, setUserData] = useState(null);
  const [learningPath, setLearningPath] = useState([]);
  const [themePreference, setThemePreference] = useState("dark");
  const [loading, setLoading] = useState(true);
  const [lessonRewardXp, setLessonRewardXp] = useState(0);
  const [lessonRewardVisible, setLessonRewardVisible] = useState(false);

  const refreshUserData = useCallback(async () => {
    if (!session) return;
    try {
      const [me, gameSummary] = await Promise.all([
        apiFetch("/auth/me"),
        fetchProfileGameSummary().catch(() => null),
      ]);
      setUserData(
        gameSummary
          ? {
              name: gameSummary.username || me?.user?.name || me?.user?.email || session?.user?.email || "User",
              xp: gameSummary.xp ?? 0,
              streak: gameSummary.streak ?? 0,
              league: gameSummary.league ?? "Bronze",
            }
          : normalizeUser(me?.user, session?.user?.email)
      );
    } catch {
      setUserData((prev) => prev ?? normalizeUser(null, session?.user?.email));
    }
  }, [session]);

  const handleCompleteLesson = useCallback(
    async ({ xpAwarded = 0 } = {}) => {
      await refreshUserData();
      if (xpAwarded > 0) {
        setLessonRewardXp(xpAwarded);
        setLessonRewardVisible(true);
      }
    },
    [refreshUserData]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      setUserData(null);
      setLearningPath([]);
      setThemePreference("dark");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const [me, settings, gameSummary] = await Promise.all([
          apiFetch("/auth/me"),
          fetchProfileSettings().catch(() => null),
          fetchProfileGameSummary().catch(() => null),
        ]);
        setUserData(
          gameSummary
            ? {
                name: gameSummary.username || me?.user?.name || me?.user?.email || session?.user?.email || "User",
                xp: gameSummary.xp ?? 0,
                streak: gameSummary.streak ?? 0,
                league: gameSummary.league ?? "Bronze",
              }
            : normalizeUser(me?.user, session?.user?.email)
        );
        setLearningPath([]);
        setThemePreference(settings?.theme_preference === "light" ? "light" : "dark");
      } catch {
        setUserData(normalizeUser(null, session?.user?.email));
        setLearningPath([]);
        setThemePreference("dark");
      } finally {
        setLoading(false);
      }
    })();
  }, [session, authLoading]);

  const navigationTheme = buildNavigationTheme(themePreference);

  if (authLoading || loading) {
    return (
      <View style={[styles.loading, themePreference === "light" ? styles.loadingLight : styles.loadingDark]}>
        <ActivityIndicator />
        <Text style={themePreference === "light" ? styles.loadingTextLight : styles.loadingTextDark}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ThemeProvider
      themePreference={themePreference}
      setThemePreference={setThemePreference}
    >
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={themePreference === "light" ? "dark" : "light"} />
        <RootNavigator
          userData={userData}
          learningPath={learningPath}
          onCompleteLesson={handleCompleteLesson}
          themePreference={themePreference}
          onThemePreferenceChange={setThemePreference}
        />
        <LessonCompleteModal
          visible={lessonRewardVisible}
          onClose={() => setLessonRewardVisible(false)}
          xp={lessonRewardXp}
        />
      </NavigationContainer>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingLight: { backgroundColor: "#f8fafc" },
  loadingDark: { backgroundColor: "#020617" },
  loadingTextLight: { color: "#0f172a" },
  loadingTextDark: { color: "#e2e8f0" },
});
