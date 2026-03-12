import React, { useEffect, useState } from "react";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { StatusBar } from "expo-status-bar";
import { enableScreens } from "react-native-screens";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import LessonCompleteModal from "./src/components/LessonCompleteModal";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { apiFetch } from "./src/api/client";
import { fetchProfileSettings } from "./src/api/profile";

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
        const [me, settings] = await Promise.all([
          apiFetch("/auth/me"),
          fetchProfileSettings().catch(() => null),
        ]);
        setUserData(normalizeUser(me?.user, session?.user?.email));
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

  const navigationTheme =
    themePreference === "light"
      ? {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: "#f8fafc",
            card: "#ffffff",
            text: "#0f172a",
            border: "#e2e8f0",
          },
        }
      : {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: "#020617",
            card: "#0f172a",
            text: "#e2e8f0",
            border: "#1e293b",
          },
        };

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
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={themePreference === "light" ? "dark" : "light"} />
      <RootNavigator
        userData={userData}
        learningPath={learningPath}
        onCompleteLesson={async () => {}}
        themePreference={themePreference}
        onThemePreferenceChange={setThemePreference}
      />
      <LessonCompleteModal visible={false} onClose={() => {}} xp={0} />
    </NavigationContainer>
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
