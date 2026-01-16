import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { StatusBar } from "expo-status-bar";
import { enableScreens } from "react-native-screens";
import * as Haptics from "expo-haptics";
import LessonCompleteModal from "./src/components/LessonCompleteModal"; // We will create this
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import usePersistedState from "./src/hooks/usePersistedState";

enableScreens();

// This data defines your "Gamified Learning Module"
const initialLearningPath = [
  {
    unit: 1,
    title: "Investing Basics",
    lessons: [
      { id: "l1-1", title: "What is a Stock?", type: "lesson", xp: 20, status: "completed" },
      { id: "l1-2", title: "Bulls vs. Bears", type: "lesson", xp: 20, status: "completed" },
      { id: "l1-3", title: "Quiz: Basics", type: "quiz", xp: 50, status: "unlocked" },
      { id: "l1-4", title: "Unit 1 Complete!", type: "milestone", xp: 0, status: "locked" },
    ],
  },
  {
    unit: 2,
    title: "Understanding REITs (SG)", // Localized content
    lessons: [
      { id: "l2-1", title: "What is a REIT?", type: "lesson", xp: 20, status: "locked" },
      { id: "l2-2", title: "Types of SG REITs", type: "lesson", xp: 20, status: "locked" },
      { id: "l2-3", title: "Quiz: REITs", type: "quiz", xp: 50, status: "locked" },
      { id: "l2-4", title: "Unit 2 Complete!", type: "milestone", xp: 0, status: "locked" },
    ],
  },
];

export default function App() {
  const [userData, setUserData] = useState({
    name: "Alex",
    xp: 3550,
    streak: 5,
    league: "Gold",
  });
  const [learningPath, setLearningPath] = useState(initialLearningPath);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const {
    value: authState,
    setValue: setAuthState,
    loading: authLoading,
  } = usePersistedState("authState", { loggedIn: false });

  // This function handles the gamification logic
  const handleCompleteLesson = (lessonId, xp) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let newPath = JSON.parse(JSON.stringify(learningPath)); // Deep copy
    let nextLessonUnlocked = false;

    for (const unit of newPath) {
      const lessonIndex = unit.lessons.findIndex((l) => l.id === lessonId);
      if (lessonIndex > -1) {
        unit.lessons[lessonIndex].status = "completed";
        const nextLessonIndex = lessonIndex + 1;
        if (nextLessonIndex < unit.lessons.length) {
          if (unit.lessons[nextLessonIndex].status === "locked") {
            unit.lessons[nextLessonIndex].status = "unlocked";
            nextLessonUnlocked = true;
          }
        }
        break; 
      }
    }

    setLearningPath(newPath);
    setUserData((prev) => ({ ...prev, xp: prev.xp + xp }));
    setEarnedXp(xp);
    setShowCongratsModal(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCloseModal = () => {
    setShowCongratsModal(false);
  };

  const handleAuthChange = (loggedIn) => {
    setAuthState({ loggedIn: !!loggedIn });
  };

  if (authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading session...</Text>
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
        isAuthed={authState.loggedIn}
        onAuthChange={handleAuthChange}
      />
      <LessonCompleteModal
        visible={showCongratsModal}
        onClose={handleCloseModal}
        xp={earnedXp}
      />
    </NavigationContainer>
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
  loadingText: {
    color: "#64748b",
    fontSize: 12,
  },
});
