import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { scale, verticalScale, moderateScale } from "../../styles/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Lock, Award, Star, TrendingUp, Flame, NotebookPen, Check } from "lucide-react-native";
import * as Haptics from 'expo-haptics';
import { fetchLessonByTopicId } from "../../api/learning";

const TOPIC_NAME_MAP = {
  1: "Introduction to Stocks",
  2: "How Stock Market Work",
  3: "Key Market Terms",
};
const TOPIC_IDS = Object.keys(TOPIC_NAME_MAP).map((id) => Number(id));
const formatSubtopicName = (name = "") => {
  const cleaned = String(name).replace(/_/g, " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "";
};
const formatStepTitle = (title = "") => {
  const cleaned = String(title)
    .replace(/^\s*\S+\s*:\s*/, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "";
};
const getDifficultyTier = (difficulty = "") => {
  const normalized = String(difficulty).trim().toLowerCase();
  if (normalized === "mastery") return "mastery";
  if (normalized === "core") return "core";
  return "basic";
};

export default function Learn({ learningPath = [], userData = {}, navigation }) {
  const [backendPath, setBackendPath] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        console.log("[Learn] loading topic ids from TOPIC_NAME_MAP", TOPIC_IDS);
        const settled = await Promise.allSettled(
          TOPIC_IDS.map((topicId) => fetchLessonByTopicId(topicId))
        );

        if (!mounted) return;

        const topicPayloads = settled
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value);

        const transformed = [];

        topicPayloads.forEach((topic) => {
          const subtopics = Array.isArray(topic?.subtopics) ? topic.subtopics : [];
          subtopics.forEach((subtopic, idx) => {
            const contents = Array.isArray(subtopic?.contents) ? subtopic.contents : [];
            transformed.push({
              unit: `${topic.topic_id}.${idx + 1}`,
              topic_id: topic.topic_id,
              topic_name: topic.topic_name,
              subtopic_id: subtopic.subtopic_id,
              subtopic_name: subtopic.subtopic_name,
              subtopic_summary: subtopic?.subtopic_summary?.summary_content ?? null,
              lessons: contents.map((content, cIdx) => ({
                id: content.content_id,
                title: formatStepTitle(content.title),
                status: cIdx === 0 ? "unlocked" : "completed",
                type: "lesson",
                xp: 0,
                difficulty: String(content.difficulty ?? "basic").trim().toLowerCase(),
                summary: content.summary,
                content_json: content.content_json,
              })),
            });
          });
        });

        console.log("[Learn] transformed learningPath", { units: transformed.length });
        setBackendPath(transformed);
      } catch (err) {
        console.log("[Learn] failed to load lessons", err?.message || err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const effectivePath = useMemo(() => {
    if (Array.isArray(learningPath) && learningPath.length > 0) return learningPath;
    return backendPath;
  }, [learningPath, backendPath]);

  const getNodeStyle = (status, type) => {
    if (type === "summary") return styles.nodeSummary;
    switch (status) {
      case "completed":
        return styles.nodeCompleted;
      case "unlocked":
        return styles.nodeUnlocked;
      default:
        return styles.nodeLocked;
    }
  };

  const getIcon = (status, type, difficulty) => {
    if (type === "summary") return <Award size={28} color="#fff" />;
    if (type === "milestone") return <Award size={28} color="#fff" />;
    if (status === "locked") return <Lock size={26} color="#94a3b8" />;

    const tier = getDifficultyTier(difficulty);
    if (tier === "mastery") return <Flame size={28} color="#fff" />;
    if (tier === "core") return <TrendingUp size={28} color="#fff" />;
    return <BookOpen size={28} color="#fff" />;

  };

  const handleLessonPress = (unit, lesson) => {
    if (lesson.status === 'locked') return;

    const mappedTopicName = TOPIC_NAME_MAP[unit.topic_id] ?? unit.topic_name;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("LessonDetail", {
      topicId: unit.topic_id,
      topicName: mappedTopicName,
      subtopicId: unit.subtopic_id,
      subtopicName: unit.subtopic_name,
      contentId: lesson.id,
      contentTitle: lesson.title,
      difficulty: lesson.difficulty,
      summary: lesson.summary,
      contentJson: lesson.content_json,
      stepIndex: 1,
    });
  };
  const handlePathItemPress = (unit, lesson, index) => {
    if (lesson.type === "summary") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.navigate("LessonDetail", {
        topicId: unit.topic_id,
        topicName: TOPIC_NAME_MAP[unit.topic_id] ?? unit.topic_name,
        subtopicId: unit.subtopic_id,
        subtopicName: formatSubtopicName(unit.subtopic_name),
        contentId: lesson.id,
        contentTitle: `${formatSubtopicName(unit.subtopic_name)} Summary`,
        difficulty: "Summary",
        summary: null,
        contentJson: unit.subtopic_summary,
        stepIndex: index + 1,
      });
      return;
    }
    handleLessonPress(unit, lesson);
  };

  const handleQuizPress = (unit, lesson, index) => {
    if (lesson.status === "locked" || lesson.type === "summary") return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("QuizDetail", {
      topicId: unit.topic_id,
      topicName: TOPIC_NAME_MAP[unit.topic_id] ?? unit.topic_name,
      subtopicId: unit.subtopic_id,
      subtopicName: formatSubtopicName(unit.subtopic_name),
      difficulty: String(lesson.difficulty ?? "basic").trim().toLowerCase(),
      lessonTitle: lesson.title,
      stepIndex: index + 1,
    });
  };

  const handleAnswerExplanationPress = (unit, lesson) => {
    if (lesson.status === "locked" || lesson.type === "summary") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
              <Text style={styles.xpText}>{userData?.xp ?? 0} XP</Text>
            </View>
        </View>

        {Object.entries(TOPIC_NAME_MAP).map(([topicIdKey, mappedTopicName]) => {
          const topicId = Number(topicIdKey);
          const topicUnits = effectivePath.filter((unit) => unit.topic_id === topicId);
          if (topicUnits.length === 0) return null;

          return (
            <View key={topicId} style={styles.topicGroup}>
              <Text style={styles.topicGroupTitle}>{mappedTopicName}</Text>

              {topicUnits.map((unit) => {
                const lessons = Array.isArray(unit.lessons) ? unit.lessons : [];
                const completedLessons = lessons.filter(l => l.status === 'completed').length;
                const unitProgress = lessons.length ? (completedLessons / lessons.length) * 100 : 0;
                const pathItems = unit.subtopic_summary
                  ? [
                      ...lessons,
                      {
                        id: `summary-${unit.subtopic_id}`,
                        title: "Summary",
                        status: "unlocked",
                        type: "summary",
                      },
                    ]
                  : lessons;

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
                        <Text style={styles.unitTitle}>{formatSubtopicName(unit.subtopic_name)}</Text>
                        {/* Progress Bar */}
                        <View style={styles.progressBarBackground}>
                          <View style={[styles.progressBarFill, { width: `${unitProgress}%` }]} />
                        </View>
                      </View>
                    </LinearGradient>

                    {/* Lesson Path */}
                    <View style={styles.pathContainer}>
                      {pathItems.map((lesson, index) => (
                        <View
                          key={lesson.id}
                          style={styles.nodeWrapper}
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

                          <View style={styles.nodeRow}>
                            <Animated.View
                              style={null}
                            >
                              <TouchableOpacity
                                activeOpacity={0.85}
                                disabled={lesson.status === "locked"}
                                style={[styles.node, getNodeStyle(lesson.status, lesson.type)]}
                                onPress={() => handlePathItemPress(unit, lesson, index)}
                              >
                                {getIcon(lesson.status, lesson.type, lesson.difficulty)}
                              </TouchableOpacity>
                            </Animated.View>

                            {lesson.type !== "summary" && (
                              <View style={styles.quizBranch}>
                                <LinearGradient
                                  colors={["#64748b", "#1e293b"]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={styles.quizBranchLine}
                                />
                                <TouchableOpacity
                                  activeOpacity={0.85}
                                  disabled={lesson.status === "locked"}
                                  style={[
                                    styles.quizNode,
                                    styles.quizNodePlaceholder,
                                  ]}
                                  onPress={() => handleQuizPress(unit, lesson, index)}
                                >
                                  <NotebookPen size={22} color="#f8fafc" />
                                </TouchableOpacity>

                                <LinearGradient
                                  colors={["#64748b", "#1e293b"]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={styles.explanationBranchLine}
                                />

                                <TouchableOpacity
                                  activeOpacity={0.85}
                                  disabled={lesson.status === "locked"}
                                  style={[
                                    styles.quizNode,
                                    styles.quizNodePlaceholder,
                                  ]}
                                  onPress={() => handleAnswerExplanationPress(unit, lesson)}
                                >
                                  <Check size={22} color="#f8fafc" />
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>

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
  topicGroup: { marginBottom: verticalScale(10) },
  topicGroupTitle: {
    fontSize: moderateScale(20),
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: verticalScale(12),
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
  unitTitle: { fontSize: moderateScale(16), color: "#f8fafc" },

  progressBarBackground: { height: 6, backgroundColor: '#334155', borderRadius: 3, marginTop: verticalScale(8), overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: '#22c55e', borderRadius: 3 },

  subtopicSummary: {
    color: "#94a3b8",
    fontSize: moderateScale(12),
    marginTop: -verticalScale(12),
    marginBottom: verticalScale(12),
    fontFamily: "Courier",
  },

  pathContainer: {
    position: "relative",
    paddingHorizontal: "10%",
    transform: [{ translateX: -scale(55) }],
  },
  nodeWrapper: { marginBottom: verticalScale(22), alignItems: "center", width: "100%" },
  nodeRow: { width: "100%", alignItems: "center", justifyContent: "center", position: "relative" },
  leftAlign: { alignItems: "flex-start" },
  rightAlign: { alignItems: "flex-end" },

  roadConnector: { position: 'absolute', top: -verticalScale(22), left: '50%', transform: [{ translateX: -1 }] },
  roadLine: { width: 2, height: verticalScale(22), borderRadius: 1 },

  node: { width: scale(72), height: scale(72), borderRadius: scale(36), alignItems: "center", justifyContent: "center" },
  nodeCompleted: { backgroundColor: "#2563eb", shadowColor: "#2563eb", shadowOpacity: 0.6, shadowRadius: 14, elevation: 8 },
  nodeUnlocked: { backgroundColor: "#22c55e", shadowColor: "#22c55e", shadowOpacity: 0.7, shadowRadius: 16, elevation: 10 },
  nodeLocked: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  nodeSummary: { backgroundColor: "#fde047", borderWidth: 1, borderColor: "#facc15", shadowColor: "#fde047", shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  quizBranch: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: scale(48),
    transform: [{ translateY: -scale(26) }],
    flexDirection: "row",
    alignItems: "center",
  },
  quizBranchLine: { width: scale(24), height: 2, borderRadius: 1 },
  explanationBranchLine: { width: scale(14), height: 2, borderRadius: 1 },
  quizNode: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    backgroundColor: "#0ea5e9",
    borderWidth: 1,
    borderColor: "#7dd3fc",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  quizNodePlaceholder: { backgroundColor: "#0f172a", borderColor: "#334155" },
  nodeLabel: {
    marginTop: verticalScale(8),
    width: scale(188),
    textAlign: "center",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    fontWeight: "600",
    color: "#e5e7eb",
    alignSelf: "center",
  },
  nodeLabelLocked: { color: "#64748b" },
});
