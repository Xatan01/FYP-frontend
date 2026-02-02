import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { StatusBar } from "expo-status-bar";
import { enableScreens } from "react-native-screens";
import * as Haptics from "expo-haptics";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";

import LessonCompleteModal from "./src/components/LessonCompleteModal";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { apiFetch } from "./src/api/client";

enableScreens();

function AppInner() {
  const { session, booting } = useAuth();

  const [userData, setUserData] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  useEffect(() => {
    if (booting) return;

    if (!session) {
      setUserData(null);
      setLearningPath(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);

        const me = await apiFetch("/api/me");
        setUserData({
          name: me.user?.email ?? "User",
          xp: 0,
          streak: 0,
          league: "Bronze",
        });

        const lp = await apiFetch("/api/learning-path");
        setLearningPath(lp.learning_path);
      } finally {
        setLoading(false);
      }
    })();
  }, [session, booting]);

  const handleCompleteLesson = async (lessonId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const res = await apiFetch("/api/lessons/complete", {
      method: "POST",
      body: { lesson_id: lessonId },
    });

    setLearningPath(res.learning_path);
    setUserData(res.user);
    setEarnedXp(res.earned_xp || 0); // match backend field name
    setShowCongratsModal(true);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (booting || loading) {
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
        onCompleteLesson={handleCompleteLesson}
      />
      <LessonCompleteModal
        visible={showCongratsModal}
        onClose={() => setShowCongratsModal(false)}
        xp={earnedXp}
      />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
  },
});
