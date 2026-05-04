import React, { useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeft, CircleCheck, CircleX, MessagesSquare } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale, scale, verticalScale } from "../../styles/responsive";
import { useAppTheme } from "../../context/ThemeContext";
import { formatDragDropAnswerPairs, getDragDropCorrectAnswer } from "./quiz_components/dragDropUtils";
import {
  buildQuizExplanation,
  formatAnswerForDisplay,
  formatReviewDifficulty,
  getCorrectAnswerText,
  isAnswerCorrect,
} from "./quiz_components/quizReviewUtils";

export default function QuizExplanationDetail({ route, navigation }) {
  const { review } = route.params || {};
  const { palette, isLight } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);

  const explanationCards = useMemo(() => {
    const questions = Array.isArray(review?.questions) ? review.questions : [];

    return questions.map((question, index) => {
      const selectedAnswerText = formatAnswerForDisplay(question, question?.selectedAnswer);
      const correctAnswerText = getCorrectAnswerText(question);
      const correct = isAnswerCorrect(question, question?.selectedAnswer);

      return {
        ...question,
        correct,
        selectedAnswerText,
        correctAnswerText,
        explanation: buildQuizExplanation({
          difficulty: review?.difficulty,
          questionIndex: index,
          correctAnswerText,
          isCorrect: correct,
        }),
      };
    });
  }, [review]);

  const computedCorrectCount = explanationCards.filter((question) => question.correct).length;
  const totalQuestionCount = explanationCards.length || Number(review?.totalQuestions || 0);
  const scoreLine = totalQuestionCount ? `${computedCorrectCount}/${totalQuestionCount} correct` : "";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={16} color="#bfdbfe" />
          <Text style={styles.backBtnText}>Back to learning path</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={isLight ? ["#dbeafe", "#eff6ff"] : ["#172554", "#0f172a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTopRow}>
            <Text style={styles.eyebrow}>ANSWER REVIEW</Text>
            <View style={styles.unitBadge}>
              <MessagesSquare size={14} color="#dbeafe" />
              <Text style={styles.unitBadgeText}>{review?.unitLabel || "Quiz Review"}</Text>
            </View>
          </View>
          <Text style={styles.title}>
            {review?.lessonTitle ? `${review.lessonTitle} Answers` : "Quiz Answer Review"}
          </Text>
          <Text style={styles.subtitle}>
            {`${formatReviewDifficulty(review?.difficulty)} review${scoreLine ? ` - ${scoreLine}` : ""}`}
          </Text>
          <Text style={styles.heroNote}>
            This screen shows your latest submitted quiz, the answers you chose,
            and a short explanation for each question.
          </Text>
        </LinearGradient>

        {!explanationCards.length ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No saved quiz attempt found.</Text>
            <Text style={styles.emptyText}>
              Take the quiz first, then reopen this screen to review your answers.
            </Text>
          </View>
        ) : null}

        {explanationCards.map((question, index) => (
          <View key={`${question.id}-${index}`} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardStep}>Question {index + 1}</Text>
              <View style={[styles.statusBadge, question.correct ? styles.statusGood : styles.statusBad]}>
                {question.correct ? (
                  <CircleCheck size={14} color="#dcfce7" />
                ) : (
                  <CircleX size={14} color="#fee2e2" />
                )}
                <Text style={styles.statusText}>{question.correct ? "Correct" : "Needs review"}</Text>
              </View>
            </View>

            {question.title ? <Text style={styles.questionTitle}>{question.title}</Text> : null}
            {question.scenario ? <Text style={styles.questionScenario}>{question.scenario}</Text> : null}
            {question.prompt ? <Text style={styles.questionPrompt}>{question.prompt}</Text> : null}

            {question.type === "drag_drop" ? (
              <>
                <View style={styles.answerBlock}>
                  <Text style={styles.answerLabel}>Selected answer</Text>
                  {formatDragDropAnswerPairs(question, question.selectedAnswer).map((pair) => (
                    <View key={`selected-${question.id}-${pair.slotKey}`} style={styles.matchRow}>
                      <Text style={styles.matchLeft}>{pair.leftLabel}</Text>
                      <Text style={[styles.matchRight, !pair.isFilled && styles.matchRightEmpty]}>
                        {pair.isFilled ? pair.value : "No match selected"}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.answerBlock}>
                  <Text style={styles.answerLabel}>Correct answer</Text>
                  {formatDragDropAnswerPairs(question, getDragDropCorrectAnswer(question)).map((pair) => (
                    <View key={`correct-${question.id}-${pair.slotKey}`} style={styles.matchRow}>
                      <Text style={styles.matchLeft}>{pair.leftLabel}</Text>
                      <Text style={styles.matchRight}>{pair.value}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                <View style={styles.answerBlock}>
                  <Text style={styles.answerLabel}>Selected answer</Text>
                  <Text style={styles.answerValue}>{question.selectedAnswerText}</Text>
                </View>

                <View style={styles.answerBlock}>
                  <Text style={styles.answerLabel}>Correct answer</Text>
                  <Text style={styles.answerValue}>{question.correctAnswerText}</Text>
                </View>
              </>
            )}

            <View style={styles.explanationBlock}>
              <Text style={styles.explanationLabel}>Explanation</Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function buildStyles(palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    container: { padding: scale(18), paddingBottom: verticalScale(48) },
    backBtn: {
      marginBottom: verticalScale(12),
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(8),
      borderRadius: 999,
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.cardBorder,
    },
    backBtnText: {
      color: palette.accentText,
      fontSize: moderateScale(13),
      fontWeight: "700",
    },
    hero: {
      borderRadius: 20,
      padding: scale(18),
      borderWidth: 1,
      borderColor: palette.inputBorder,
      marginBottom: verticalScale(14),
      gap: verticalScale(8),
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: scale(10),
    },
    eyebrow: {
      color: "#7dd3fc",
      fontSize: moderateScale(11),
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    unitBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(6),
      borderRadius: 999,
      backgroundColor: "rgba(37, 99, 235, 0.25)",
      borderWidth: 1,
      borderColor: "rgba(147, 197, 253, 0.4)",
    },
    unitBadgeText: {
      color: "#dbeafe",
      fontSize: moderateScale(11),
      fontWeight: "800",
    },
    title: {
      color: palette.textPrimary,
      fontSize: moderateScale(24),
      fontWeight: "800",
    },
    subtitle: {
      color: palette.textMuted,
      fontSize: moderateScale(13),
    },
    heroNote: {
      color: palette.textSecondary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(19),
    },
    emptyCard: {
      backgroundColor: palette.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      padding: scale(14),
    },
    emptyTitle: {
      color: palette.textPrimary,
      fontSize: moderateScale(15),
      fontWeight: "800",
      marginBottom: verticalScale(6),
    },
    emptyText: {
      color: palette.textSecondary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(19),
    },
    card: {
      backgroundColor: palette.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      padding: scale(14),
      marginBottom: verticalScale(12),
      gap: verticalScale(10),
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: scale(10),
    },
    cardStep: {
      color: "#93c5fd",
      fontSize: moderateScale(11),
      fontWeight: "800",
      textTransform: "uppercase",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      borderRadius: 999,
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(5),
      borderWidth: 1,
    },
    statusGood: {
      backgroundColor: "#14532d",
      borderColor: "#22c55e",
    },
    statusBad: {
      backgroundColor: "#7f1d1d",
      borderColor: "#ef4444",
    },
    statusText: {
      color: "#f8fafc",
      fontSize: moderateScale(11),
      fontWeight: "800",
    },
    questionTitle: {
      color: palette.textPrimary,
      fontSize: moderateScale(16),
      fontWeight: "800",
    },
    questionScenario: {
      color: "#cbd5e1",
      fontSize: moderateScale(12),
      lineHeight: moderateScale(18),
      padding: scale(10),
      borderRadius: 12,
      backgroundColor: palette.backgroundAlt,
      borderWidth: 1,
      borderColor: palette.cardBorder,
    },
    questionPrompt: {
      color: palette.textSecondary,
      fontSize: moderateScale(14),
      lineHeight: moderateScale(21),
      fontWeight: "600",
    },
    answerBlock: {
      borderRadius: 12,
      padding: scale(10),
      backgroundColor: palette.backgroundAlt,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      gap: verticalScale(4),
    },
    answerLabel: {
      color: "#93c5fd",
      fontSize: moderateScale(11),
      fontWeight: "800",
      textTransform: "uppercase",
    },
    answerValue: {
      color: palette.textPrimary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(19),
      fontWeight: "600",
    },
    matchRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: scale(10),
      paddingVertical: verticalScale(6),
      borderTopWidth: 1,
      borderTopColor: palette.cardBorder,
    },
    matchLeft: {
      color: "#93c5fd",
      fontSize: moderateScale(12),
      fontWeight: "800",
      flex: 0.95,
    },
    matchRight: {
      color: palette.textPrimary,
      fontSize: moderateScale(12),
      lineHeight: moderateScale(18),
      fontWeight: "700",
      flex: 1.2,
      textAlign: "right",
    },
    matchRightEmpty: {
      color: palette.textMuted,
    },
    explanationBlock: {
      borderRadius: 14,
      padding: scale(12),
      backgroundColor: "#172554",
      borderWidth: 1,
      borderColor: "#3b82f6",
      gap: verticalScale(6),
    },
    explanationLabel: {
      color: "#bfdbfe",
      fontSize: moderateScale(11),
      fontWeight: "800",
      textTransform: "uppercase",
    },
    explanationText: {
      color: "#eff6ff",
      fontSize: moderateScale(13),
      lineHeight: moderateScale(20),
      fontWeight: "600",
    },
  });
}
