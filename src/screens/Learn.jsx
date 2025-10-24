import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
} from "../styles/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Check, Lock, Play, Award } from "lucide-react-native";
import usePulseAnimation from "../hooks/usePulseAnimation"; // We will create this

export default function Learn({ learningPath, onCompleteLesson }) {
  const pulseAnimation = usePulseAnimation(); // Get the pulsing style

  const getNodeStyle = (status) => {
    switch (status) {
      case "completed":
        return styles.nodeCompleted;
      case "unlocked":
        return styles.nodeUnlocked;
      case "locked":
      default:
        return styles.nodeLocked;
    }
  };

  const getIcon = (status, type) => {
    if (type === "milestone") return <Award size={32} color="#fff" />;
    switch (status) {
      case "completed":
        return <Check size={32} color="#fff" />;
      case "unlocked":
        return <Play size={32} color="#fff" />;
      case "locked":
      default:
        return <Lock size={32} color="#94a3b8" />;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16), alignItems: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Your Learning Path</Text>

        {learningPath.map((unit) => (
          <View key={unit.unit} style={styles.unitContainer}>
            {/* Unit Title Card */}
            <LinearGradient
              colors={["#3b82f6", "#1d4ed8"]}
              style={styles.unitCard}
            >
              <Text style={styles.unitTitle}>Unit {unit.unit}</Text>
              <Text style={styles.unitSubtitle}>{unit.title}</Text>
              <View style={styles.unitIcon}>
                <BookOpen size={20} color="#3b82f6" />
              </View>
            </LinearGradient>

            {/* Lessons */}
            {unit.lessons.map((lesson, index) => (
              <View
                key={lesson.id}
                style={[
                  styles.nodeWrapper,
                  { alignItems: index % 2 === 0 ? "flex-start" : "flex-end" },
                ]}
              >
                <Animated.View
                  style={lesson.status === "unlocked" ? pulseAnimation : {}}
                >
                  <TouchableOpacity
                    style={[styles.node, getNodeStyle(lesson.status)]}
                    disabled={lesson.status === "locked"}
                    onPress={() => onCompleteLesson(lesson.id, lesson.xp)}
                  >
                    {getIcon(lesson.status, lesson.type)}
                  </TouchableOpacity>
                </Animated.View>
                <Text style={styles.nodeText}>{lesson.title}</Text>
              </View>
            ))}
          </View>
        ))}
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
    marginBottom: verticalScale(16),
  },
  unitContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  unitCard: {
    width: "90%",
    borderRadius: 16,
    padding: scale(16),
    marginBottom: verticalScale(20),
  },
  unitTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#fff",
  },
  unitSubtitle: {
    fontSize: moderateScale(14),
    color: "#e0f2fe",
  },
  unitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 16,
    top: 16,
  },
  nodeWrapper: {
    width: "100%",
    paddingHorizontal: "20%", // Indent the nodes
    alignItems: "flex-start",
    marginBottom: verticalScale(10),
  },
  node: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  nodeCompleted: {
    backgroundColor: "#2563eb",
  },
  nodeUnlocked: {
    backgroundColor: "#16a34a",
    shadowColor: "#16a34a", // Add a "glow"
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  nodeLocked: {
    backgroundColor: "#e2e8f0",
    elevation: 1,
    shadowOpacity: 0.05,
  },
  nodeText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#334155",
    marginTop: verticalScale(4),
  },
});