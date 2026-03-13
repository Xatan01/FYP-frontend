import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { scale, verticalScale, moderateScale } from "../../styles/responsive";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  Lock,
  Award,
  Star,
  TrendingUp,
  Flame,
  NotebookPen,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { fetchLessonByTopicId, fetchSubtopicSummary } from "../../api/learning";
import usePersistedState from "../../hooks/usePersistedState";
import usePulseAnimation from "../../hooks/usePulseAnimation";
import { useAppTheme } from "../../context/ThemeContext";
import LoadingState from "../../components/LoadingState";

const TOPIC_NAME_MAP = {
  1: "Introduction to Stocks",
  2: "How Stock Market Work",
  3: "Key Market Terms",
};
const TOPIC_IDS = Object.keys(TOPIC_NAME_MAP).map((id) => Number(id));
const LESSON_COMPLETION_KEY = "learningLessonCompletionV2";

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

function createDefaultProgressState() {
  return {
    completedLessonsBySubtopic: {},
  };
}

function normalizeProgressState(value) {
  const base = value && typeof value === "object" ? value : {};
  const completedLessonsBySubtopic =
    base.completedLessonsBySubtopic && typeof base.completedLessonsBySubtopic === "object"
      ? base.completedLessonsBySubtopic
      : {};

  return {
    completedLessonsBySubtopic: Object.fromEntries(
      Object.entries(completedLessonsBySubtopic).map(([subtopicId, lessonIds]) => {
        if (!Array.isArray(lessonIds)) return [subtopicId, []];
        return [subtopicId, lessonIds.map((id) => String(id))];
      })
    ),
  };
}

function cloneProgressState(value) {
  const normalized = normalizeProgressState(value);
  return {
    completedLessonsBySubtopic: Object.fromEntries(
      Object.entries(normalized.completedLessonsBySubtopic).map(([subtopicId, lessonIds]) => [
        subtopicId,
        [...lessonIds],
      ])
    ),
  };
}

export default function Learn({ learningPath = [], userData = {}, navigation, route }) {
  const { palette, isLight } = useAppTheme();
  const [backendPath, setBackendPath] = useState([]);
  const [topicPanels, setTopicPanels] = useState(() =>
    Object.fromEntries(
      TOPIC_IDS.map((topicId) => [
        String(topicId),
        { expanded: false, loading: false, loaded: false, error: "" },
      ])
    )
  );
  const pulseStyle = usePulseAnimation();
  const styles = useMemo(() => buildStyles(palette), [palette]);

  const {
    value: progressState,
    setValue: setProgressState,
    loading: progressLoading,
    error: progressError,
  } = usePersistedState(LESSON_COMPLETION_KEY, createDefaultProgressState());

  const loadTopicUnits = useCallback(async (topicId) => {
    const topicKey = String(topicId);
    setTopicPanels((prev) => ({
      ...prev,
      [topicKey]: {
        ...(prev[topicKey] || {}),
        loading: true,
        error: "",
      },
    }));

    try {
      const topic = await fetchLessonByTopicId(topicId);
      const subtopics = Array.isArray(topic?.subtopics) ? topic.subtopics : [];
      const transformed = subtopics.map((subtopic, idx) => {
        const contents = Array.isArray(subtopic?.contents) ? subtopic.contents : [];
        return {
          unit: `${topic.topic_id}.${idx + 1}`,
          topic_id: topic.topic_id,
          topic_name: topic.topic_name,
          subtopic_id: subtopic.subtopic_id,
          subtopic_name: subtopic.subtopic_name,
          is_unlocked: subtopic.is_unlocked === true,
          can_unlock: subtopic.can_unlock === true,
          requires_profiling: subtopic.requires_profiling !== false,
          stage: subtopic.stage ?? null,
          is_completed: subtopic.is_completed === true,
          subtopic_summary: subtopic?.subtopic_summary?.summary_content ?? null,
          lessons: contents.map((content, cIdx) => ({
            id: content.content_id ?? `${subtopic.subtopic_id}-${cIdx + 1}`,
            title: formatStepTitle(content.title),
            type: "lesson",
            xp: 0,
            difficulty: String(content.difficulty ?? "basic").trim().toLowerCase(),
            summary: content.summary,
            content_json: content.content_json,
          })),
        };
      });

      setBackendPath((prev) => {
        const withoutTopic = prev.filter((unit) => unit.topic_id !== topicId);
        return [...withoutTopic, ...transformed].sort((a, b) => {
          if (a.topic_id !== b.topic_id) return a.topic_id - b.topic_id;
          return (a.subtopic_id ?? 0) - (b.subtopic_id ?? 0);
        });
      });

      setTopicPanels((prev) => ({
        ...prev,
        [topicKey]: {
          ...(prev[topicKey] || {}),
          loading: false,
          loaded: true,
          error: "",
        },
      }));
    } catch (err) {
      console.log("[Learn] failed to load topic", topicId, err?.message || err);
      setTopicPanels((prev) => ({
        ...prev,
        [topicKey]: {
          ...(prev[topicKey] || {}),
          loading: false,
          loaded: false,
          error: err?.message || "Failed to load subtopics.",
        },
      }));
    }
  }, []);

  const handleTopicHeaderPress = useCallback(
    (topicId) => {
      const topicKey = String(topicId);
      const panel = topicPanels[topicKey] || {
        expanded: false,
        loading: false,
        loaded: false,
        error: "",
      };
      const nextExpanded = !panel.expanded;

      setTopicPanels((prev) => ({
        ...prev,
        [topicKey]: {
          ...(prev[topicKey] || panel),
          expanded: nextExpanded,
        },
      }));

      if (nextExpanded && !panel.loaded && !panel.loading) {
        loadTopicUnits(topicId);
      }
    },
    [loadTopicUnits, topicPanels]
  );

  useEffect(() => {
    const refreshTopicId = route?.params?.refreshTopicId;
    const refreshAt = route?.params?.refreshAt;
    if (!refreshTopicId || !refreshAt) return;

    loadTopicUnits(refreshTopicId).finally(() => {
      navigation.setParams?.({
        refreshTopicId: undefined,
        refreshAt: undefined,
      });
    });
  }, [
    loadTopicUnits,
    navigation,
    route?.params?.refreshAt,
    route?.params?.refreshTopicId,
  ]);

  const normalizedProgressState = useMemo(
    () => normalizeProgressState(progressState),
    [progressState]
  );

  const sourcePath = useMemo(() => {
    const rawPath = Array.isArray(learningPath) && learningPath.length > 0 ? learningPath : backendPath;
    return rawPath.map((unit, unitIndex) => {
      const lessons = Array.isArray(unit?.lessons) ? unit.lessons : [];
      return {
        ...unit,
        unit: unit.unit ?? `${unit.topic_id ?? 0}.${unitIndex + 1}`,
        lessons: lessons.map((lesson, lessonIndex) => ({
          id: lesson.id ?? lesson.content_id ?? `${unit.subtopic_id}-${lessonIndex + 1}`,
          title: formatStepTitle(lesson.title ?? `Step ${lessonIndex + 1}`),
          type: "lesson",
          xp: lesson.xp ?? 0,
          difficulty: String(lesson.difficulty ?? "basic").trim().toLowerCase(),
          summary: lesson.summary,
          content_json: lesson.content_json,
        })),
      };
    });
  }, [learningPath, backendPath]);

  const pathWithProgress = useMemo(() => {
    return sourcePath.map((unit) => {
      const subtopicKey = String(unit.subtopic_id ?? "");
      const lessons = Array.isArray(unit.lessons) ? unit.lessons : [];
      const completedLessonIds = new Set(
        normalizedProgressState.completedLessonsBySubtopic[subtopicKey] || []
      );

      const isUnlocked = unit.is_unlocked === true;
      const canUnlock = unit.can_unlock === true;
      const requiresProfiling = unit.requires_profiling !== false;
      const isCompleted = unit.is_completed === true;

      let foundCurrentStep = false;
      const lessonsWithStatus = lessons.map((lesson) => {
        const lessonId = String(lesson.id);

        if (!isUnlocked) {
          return { ...lesson, status: "locked" };
        }

        if (isCompleted || completedLessonIds.has(lessonId)) {
          return { ...lesson, status: "completed" };
        }

        if (!foundCurrentStep) {
          foundCurrentStep = true;
          return { ...lesson, status: "unlocked" };
        }

        return { ...lesson, status: "locked" };
      });

      const completedLessons = lessonsWithStatus.filter((lesson) => lesson.status === "completed").length;
      const unitProgress = lessonsWithStatus.length
        ? (completedLessons / lessonsWithStatus.length) * 100
        : 0;

      const allLessonsCompleted =
        lessonsWithStatus.length > 0 && lessonsWithStatus.every((lesson) => lesson.status === "completed");

      const visibleLessons = lessonsWithStatus;

      return {
        ...unit,
        isUnlocked,
        canUnlock,
        requiresProfiling,
        unitProgress,
        lessons: lessonsWithStatus,
        visibleLessons,
        summaryUnlocked: isUnlocked && (isCompleted || allLessonsCompleted),
      };
    });
  }, [sourcePath, normalizedProgressState]);

  const updateProgressState = useCallback(
    (mutator) => {
      setProgressState((prevState) => {
        const draft = cloneProgressState(prevState);
        const updated = mutator(draft) || draft;
        return normalizeProgressState(updated);
      });
    },
    [setProgressState]
  );

  const completeLesson = useCallback(
    (unit, lesson) => {
      const subtopicKey = String(unit?.subtopic_id ?? "");
      const lessonId = String(lesson?.id ?? "");

      updateProgressState((draft) => {
        const existing = new Set(draft.completedLessonsBySubtopic[subtopicKey] || []);
        existing.add(lessonId);
        draft.completedLessonsBySubtopic[subtopicKey] = Array.from(existing);

        return draft;
      });
    },
    [updateProgressState]
  );

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
    if (lesson.status === "locked") return;

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

  const handlePathItemPress = async (unit, lesson, index) => {
    if (lesson.type === "summary") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const summary = await fetchSubtopicSummary(unit.subtopic_id);
        await loadTopicUnits(unit.topic_id);
        navigation.navigate("LessonDetail", {
          topicId: unit.topic_id,
          topicName: TOPIC_NAME_MAP[unit.topic_id] ?? unit.topic_name,
          subtopicId: unit.subtopic_id,
          subtopicName: formatSubtopicName(unit.subtopic_name),
          contentId: lesson.id,
          contentTitle: `${formatSubtopicName(unit.subtopic_name)} Summary`,
          difficulty: "Summary",
          summary: null,
          contentJson: summary?.summary_content ?? unit.subtopic_summary,
          stepIndex: index + 1,
        });
      } catch (err) {
        Alert.alert("Summary unavailable", err?.message || "Failed to load summary.");
      }
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
      onQuizPassed: () => {
        completeLesson(unit, lesson);
      },
    });
  };

  const handleAnswerExplanationPress = (unit, lesson) => {
    if (lesson.status === "locked" || lesson.type === "summary") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUnlockPress = (unit) => {
    if (unit.isUnlocked || !unit.canUnlock) return;

    if (unit.requiresProfiling) {
      Alert.alert(
        "Profiling quiz required",
        "Take the profiling quiz to unlock your first subtopic.",
        [
          {
            text: "Not now",
            style: "cancel",
          },
          {
            text: "Take profiling quiz",
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("QuizDetail", {
                topicId: unit.topic_id,
                topicName: TOPIC_NAME_MAP[unit.topic_id] ?? unit.topic_name,
                subtopicId: unit.subtopic_id,
                subtopicName: formatSubtopicName(unit.subtopic_name),
                difficulty: "basic",
                lessonTitle: `${formatSubtopicName(unit.subtopic_name)} Profiling`,
                quizMode: "profiling",
                onProfilingComplete: async () => {
                  await loadTopicUnits(unit.topic_id);
                },
              });
            },
          },
        ]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    loadTopicUnits(unit.topic_id);
  };

  const isInitialLoading = progressLoading;

  return (
    <SafeAreaView style={styles.safe}>
      {isInitialLoading ? (
        <LoadingState
          variant="screen"
          title="Loading learning path"
          message="Restoring lesson progress and unlocking the next steps."
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <View style={styles.headerWrap}>
              <Text style={styles.header}>Learning Path</Text>
              <Text style={styles.headerSub}>Unlock each subtopic to reveal steps</Text>
              {progressError ? <Text style={styles.warningText}>{progressError}</Text> : null}
            </View>
            <View style={styles.xpBadge}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.xpText}>{userData?.xp ?? 0} XP</Text>
            </View>
          </View>

          {Object.entries(TOPIC_NAME_MAP).map(([topicIdKey, mappedTopicName]) => {
            const topicId = Number(topicIdKey);
            const topicKey = String(topicId);
            const panel = topicPanels[topicKey] || {
              expanded: false,
              loading: false,
              loaded: false,
              error: "",
            };
            const topicUnits = pathWithProgress.filter((unit) => unit.topic_id === topicId);

            return (
              <View key={topicId} style={styles.topicGroup}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.topicHeaderBtn}
                  onPress={() => handleTopicHeaderPress(topicId)}
                >
                  <Text style={styles.topicGroupTitle}>{mappedTopicName}</Text>
                  {panel.expanded ? (
                    <ChevronDown size={18} color="#cbd5e1" />
                  ) : (
                    <ChevronRight size={18} color="#cbd5e1" />
                  )}
                </TouchableOpacity>

                {panel.expanded ? (
                  panel.loading ? (
                    <LoadingState
                      title="Loading subtopics"
                      message={`Pulling the latest lessons for ${mappedTopicName}.`}
                    />
                  ) : panel.error ? (
                    <View style={styles.topicStatusCard}>
                      <Text style={styles.topicErrorText}>{panel.error}</Text>
                      <TouchableOpacity
                        style={styles.retryTopicBtn}
                        onPress={() => loadTopicUnits(topicId)}
                      >
                        <Text style={styles.retryTopicBtnText}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  ) : topicUnits.length === 0 ? (
                    <View style={styles.topicStatusCard}>
                      <Text style={styles.topicStatusText}>No subtopics found.</Text>
                    </View>
                  ) : (
                    topicUnits.map((unit) => {
                      const pathItems = unit.summaryUnlocked
                        ? [
                            ...unit.visibleLessons,
                            {
                              id: `summary-${unit.subtopic_id}`,
                              title: "Summary",
                              status: "unlocked",
                              type: "summary",
                            },
                          ]
                        : unit.visibleLessons;

                      return (
                        <View key={unit.unit} style={styles.unitContainer}>
                          <LinearGradient
                            colors={isLight ? ["#eff6ff", "#dbeafe"] : ["#0f172a", "#1e293b"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.unitCard}
                          >
                            <View>
                              <Text style={styles.unitOverline}>UNIT {unit.unit}</Text>
                              <Text style={styles.unitTitle}>{formatSubtopicName(unit.subtopic_name)}</Text>
                              <View style={styles.progressBarBackground}>
                                <View style={[styles.progressBarFill, { width: `${unit.unitProgress}%` }]} />
                              </View>
                            </View>
                          </LinearGradient>

                          {!unit.isUnlocked ? (
                            <View style={styles.lockedPanel}>
                              <Lock size={18} color="#94a3b8" />
                              <Text style={styles.lockedTitle}>Subtopic locked</Text>
                              <Text style={styles.lockedSubtitle}>
                                {unit.canUnlock
                                  ? unit.requiresProfiling
                                    ? "Take the profiling quiz to unlock this subtopic."
                                    : "Unlock this subtopic to reveal its steps."
                                  : "Complete the previous subtopic first."}
                              </Text>
                              <TouchableOpacity
                                activeOpacity={0.85}
                                disabled={!unit.canUnlock}
                                style={[
                                  styles.unlockBtn,
                                  !unit.canUnlock && styles.unlockBtnDisabled,
                                ]}
                                onPress={() => handleUnlockPress(unit)}
                              >
                                <Text style={styles.unlockBtnText}>
                                  {unit.requiresProfiling ? "Take profiling quiz" : "Unlock subtopic"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View style={styles.pathContainer}>
                              {pathItems.map((lesson, index) => (
                                <View key={lesson.id} style={styles.nodeWrapper}>
                                  {index !== 0 && (
                                    <View style={styles.roadConnector}>
                                      <LinearGradient
                                        colors={isLight ? ["#cbd5e1", "#94a3b8"] : ["#64748b", "#1e293b"]}
                                        style={styles.roadLine}
                                      />
                                    </View>
                                  )}

                                  <View style={styles.nodeRow}>
                                    <Animated.View
                                      style={
                                        lesson.status === "unlocked" && lesson.type !== "summary"
                                          ? pulseStyle
                                          : null
                                      }
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
                                          colors={isLight ? ["#cbd5e1", "#94a3b8"] : ["#64748b", "#1e293b"]}
                                          start={{ x: 0, y: 0 }}
                                          end={{ x: 1, y: 0 }}
                                          style={styles.quizBranchLine}
                                        />
                                        <TouchableOpacity
                                          activeOpacity={0.85}
                                          disabled={lesson.status === "locked"}
                                          style={[
                                            styles.quizNode,
                                            lesson.status === "locked"
                                              ? styles.quizNodeLocked
                                              : styles.quizNodeReady,
                                          ]}
                                          onPress={() => handleQuizPress(unit, lesson, index)}
                                        >
                                          {lesson.status === "locked" ? (
                                            <Lock size={22} color={palette.textMuted} />
                                          ) : (
                                            <NotebookPen size={22} color={palette.textPrimary} />
                                          )}
                                        </TouchableOpacity>

                                        <LinearGradient
                                          colors={isLight ? ["#cbd5e1", "#94a3b8"] : ["#64748b", "#1e293b"]}
                                          start={{ x: 0, y: 0 }}
                                          end={{ x: 1, y: 0 }}
                                          style={styles.explanationBranchLine}
                                        />

                                        <TouchableOpacity
                                          activeOpacity={0.85}
                                          disabled={lesson.status === "locked"}
                                          style={[
                                            styles.quizNode,
                                            lesson.status === "locked"
                                              ? styles.quizNodeLocked
                                              : styles.quizNodeReady,
                                          ]}
                                          onPress={() => handleAnswerExplanationPress(unit, lesson)}
                                        >
                                          {lesson.status === "locked" ? (
                                            <Lock size={22} color={palette.textMuted} />
                                          ) : (
                                            <Check size={22} color={palette.textPrimary} />
                                          )}
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
                          )}
                        </View>
                      );
                    })
                  )
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function buildStyles(palette) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  scroll: { padding: scale(18), paddingBottom: verticalScale(60) },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(8),
  },
  loadingText: {
    color: palette.textMuted,
    fontSize: moderateScale(13),
    fontWeight: "600",
  },
  warningText: {
    color: palette.danger,
    fontSize: moderateScale(12),
    marginTop: verticalScale(6),
  },
  headerWrap: { marginBottom: verticalScale(28) },
  header: { fontSize: moderateScale(28), fontWeight: "900", color: palette.textPrimary },
  headerSub: { fontSize: moderateScale(14), color: palette.textMuted, marginTop: 4 },
  headerContainer: {
    width: "100%",
    paddingHorizontal: scale(20),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FED7AA",
    marginRight: -30,
  },
  xpText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#c7a47b",
    marginLeft: 6,
  },
  topicGroup: { marginBottom: verticalScale(10) },
  topicHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 14,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(10),
  },
  topicStatusCard: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 12,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    marginBottom: verticalScale(12),
  },
  topicStatusText: {
    color: palette.textMuted,
    fontSize: moderateScale(12),
    marginTop: verticalScale(6),
  },
  topicErrorText: {
    color: "#fca5a5",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  retryTopicBtn: {
    alignSelf: "flex-start",
    backgroundColor: palette.accent,
    borderRadius: 10,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(7),
  },
  retryTopicBtnText: {
    color: "#dbeafe",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  topicGroupTitle: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    color: palette.textPrimary,
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
  unitOverline: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    letterSpacing: 1.2,
    color: palette.textMuted,
    marginBottom: 2,
  },
  unitTitle: { fontSize: moderateScale(16), color: "#f8fafc" },

  progressBarBackground: {
    height: 6,
    backgroundColor: palette.inputBorder,
    borderRadius: 3,
    marginTop: verticalScale(8),
    overflow: "hidden",
  },
  progressBarFill: { height: 6, backgroundColor: "#22c55e", borderRadius: 3 },

  lockedPanel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    backgroundColor: palette.card,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(14),
    alignItems: "center",
    marginTop: -verticalScale(6),
  },
  lockedTitle: {
    color: palette.textPrimary,
    fontSize: moderateScale(14),
    fontWeight: "800",
    marginTop: verticalScale(6),
  },
  lockedSubtitle: {
    color: "#94a3b8",
    fontSize: moderateScale(12),
    textAlign: "center",
    lineHeight: moderateScale(18),
    marginTop: verticalScale(4),
    marginBottom: verticalScale(12),
  },
  unlockBtn: {
    minWidth: scale(170),
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(16),
    alignItems: "center",
  },
  unlockBtnDisabled: {
    backgroundColor: "#1e293b",
  },
  unlockBtnText: {
    color: "#eff6ff",
    fontSize: moderateScale(12),
    fontWeight: "800",
  },

  pathContainer: {
    position: "relative",
    paddingHorizontal: "10%",
    transform: [{ translateX: -scale(55) }],
  },
  nodeWrapper: { marginBottom: verticalScale(22), alignItems: "center", width: "100%" },
  nodeRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  roadConnector: {
    position: "absolute",
    top: -verticalScale(22),
    left: "50%",
    transform: [{ translateX: -1 }],
  },
  roadLine: { width: 2, height: verticalScale(22), borderRadius: 1 },

  node: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    alignItems: "center",
    justifyContent: "center",
  },
  nodeCompleted: {
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
  nodeUnlocked: {
    backgroundColor: "#22c55e",
    shadowColor: "#22c55e",
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 10,
  },
  nodeLocked: { backgroundColor: palette.cardMuted, borderWidth: 1, borderColor: palette.inputBorder },
  nodeSummary: {
    backgroundColor: "#fde047",
    borderWidth: 1,
    borderColor: "#facc15",
    shadowColor: "#fde047",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
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
  quizNodeReady: { backgroundColor: palette.card, borderColor: palette.inputBorder },
  quizNodeLocked: { backgroundColor: palette.backgroundAlt, borderColor: palette.inputBorder },
  nodeLabel: {
    marginTop: verticalScale(8),
    width: scale(188),
    textAlign: "center",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    fontWeight: "600",
    color: palette.textPrimary,
    alignSelf: "center",
  },
  nodeLabelLocked: { color: palette.textMuted },
  });
}
