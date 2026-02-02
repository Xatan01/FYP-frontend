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
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Check, Lock, Play, Award, Star } from "lucide-react-native";
import * as Haptics from 'expo-haptics';
import usePulseAnimation from "../hooks/usePulseAnimation";

export default function Learn({ learningPath, onCompleteLesson }) {
  const pulseAnimation = usePulseAnimation();

  const getNodeStyle = (status) => {
    switch (status) {
      case "completed":
        return styles.nodeCompleted;
      case "unlocked":
        return styles.nodeUnlocked;
      default:
        return styles.nodeLocked;
    }
  };

  const getIcon = (status, type) => {
    if (type === "milestone") return <Award size={28} color="#fff" />;
    switch (status) {
      case "completed":
        return <Check size={28} color="#fff" />;
      case "unlocked":
        return <Play size={28} color="#fff" />;
      default:
        return <Lock size={26} color="#94a3b8" />;
    }
  };

  const handleLessonPress = (lesson) => {
    if (lesson.status !== 'locked') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onCompleteLesson(lesson.id);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
            <View style={styles.headerWrap}>
              <Text style={styles.header}>Learning Path</Text>
              <Text style={styles.headerSub}>Master concepts step-by-step</Text>
            </View>
            <View style={styles.xpBadge}>
              <Star size={16} color="#F59E0B" fill="#F59E0B"/>
              <Text style={styles.xpText}>1,240 XP</Text>
            </View>
        </View>

        {learningPath.map((unit) => {
          const completedLessons = unit.lessons.filter(l => l.status === 'completed').length;
          const unitProgress = (completedLessons / unit.lessons.length) * 100;

          return (
            <View key={unit.unit} style={styles.unitContainer}>
              {/* Unit Card */}
              <LinearGradient
                colors={["#0f172a", "#1e293b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.unitCard}
              >
                <View>
                  <Text style={styles.unitOverline}>UNIT {unit.unit}</Text>
                  <Text style={styles.unitTitle}>{unit.title}</Text>
                  {/* Progress Bar */}
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${unitProgress}%` }]} />
                  </View>
                </View>

                <View style={styles.unitIconWrap}>
                  <BookOpen size={18} color="#0f172a" />
                </View>
              </LinearGradient>

              {/* Lesson Path */}
              <View style={styles.pathContainer}>
                {unit.lessons.map((lesson, index) => (
                  <View
                    key={lesson.id}
                    style={[
                      styles.nodeWrapper,
                      index % 2 === 0 ? styles.leftAlign : styles.rightAlign,
                    ]}
                  >
                    {/* Road Path */}
                    {index !== 0 && (
                      <View style={styles.roadConnector}>
                        <LinearGradient
                          colors={["#64748b", "#1e293b"]}
                          style={styles.roadLine}
                        />
                      </View>
                    )}

                    <Animated.View
                      style={lesson.status === "unlocked" ? pulseAnimation : null}
                    >
                      <TouchableOpacity
                        activeOpacity={0.85}
                        disabled={lesson.status === "locked"}
                        style={[styles.node, getNodeStyle(lesson.status)]}
                        onPress={() => handleLessonPress(lesson)}
                      >
                        {getIcon(lesson.status, lesson.type)}
                      </TouchableOpacity>
                    </Animated.View>

                    <Text
                      style={[
                        styles.nodeLabel,
                        lesson.status === "locked" && styles.nodeLabelLocked,
                      ]}
                    >
                      {lesson.title}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { padding: scale(18), paddingBottom: verticalScale(60) },
  headerWrap: { marginBottom: verticalScale(28) },
  header: { fontSize: moderateScale(28), fontWeight: "900", color: "#f8fafc" },
  headerSub: { fontSize: moderateScale(14), color: "#94a3b8", marginTop: 4 },
  headerContainer: {
    width: "100%",
    paddingHorizontal: scale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginRight: -30
  },
  xpText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#c7a47b',
    marginLeft: 6
  },
  unitContainer: { marginBottom: verticalScale(36) },
  unitCard: {
    borderRadius: 22,
    padding: scale(20),
    marginBottom: verticalScale(24),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  unitOverline: { fontSize: moderateScale(11), fontWeight: "700", letterSpacing: 1.2, color: "#94a3b8", marginBottom: 2 },
  unitTitle: { fontSize: moderateScale(18), fontWeight: "800", color: "#f8fafc" },
  unitIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },

  progressBarBackground: { height: 6, backgroundColor: '#334155', borderRadius: 3, marginTop: verticalScale(8), overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: '#22c55e', borderRadius: 3 },

  pathContainer: { position: "relative", paddingHorizontal: "10%" },
  nodeWrapper: { marginBottom: verticalScale(22) },
  leftAlign: { alignItems: "flex-start" },
  rightAlign: { alignItems: "flex-end" },

  roadConnector: { position: 'absolute', top: -verticalScale(22), left: '50%', transform: [{ translateX: -1 }] },
  roadLine: { width: 2, height: verticalScale(22), borderRadius: 1 },

  node: { width: scale(72), height: scale(72), borderRadius: scale(36), alignItems: "center", justifyContent: "center" },
  nodeCompleted: { backgroundColor: "#2563eb", shadowColor: "#2563eb", shadowOpacity: 0.6, shadowRadius: 14, elevation: 8 },
  nodeUnlocked: { backgroundColor: "#22c55e", shadowColor: "#22c55e", shadowOpacity: 0.7, shadowRadius: 16, elevation: 10 },
  nodeLocked: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  nodeLabel: { marginTop: verticalScale(8), maxWidth: scale(150), fontSize: moderateScale(13), fontWeight: "600", color: "#e5e7eb" },
  nodeLabelLocked: { color: "#64748b" },
});