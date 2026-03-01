import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { StatusBar } from "expo-status-bar";
import { enableScreens } from "react-native-screens";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import LessonCompleteModal from "./src/components/LessonCompleteModal";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { apiFetch } from "./src/api/client";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      setUserData(null);
      setLearningPath([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const me = await apiFetch("/auth/me");
        setUserData(normalizeUser(me?.user, session?.user?.email));
        setLearningPath([]);
      } catch {
        setUserData(normalizeUser(null, session?.user?.email));
        setLearningPath([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [session, authLoading]);

  if (authLoading || loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <RootNavigator
        userData={userData}
        learningPath={learningPath}
        onCompleteLesson={async () => {}}
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
    backgroundColor: "#f8fafc",
  },
});
