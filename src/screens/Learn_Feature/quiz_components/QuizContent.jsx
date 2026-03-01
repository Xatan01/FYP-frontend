import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale, scale, verticalScale } from "../../../styles/responsive";
import QuestionInteraction from "./QuestionInteraction";
import { formatDifficulty } from "./quizUtils";

export default function QuizContent({
  navigation,
  difficulty,
  lessonTitle,
  subtitle,
  loading,
  error,
  totalQuestions,
  finished,
  submitting = false,
  submitResult = null,
  answeredCount,
  currentIndex,
  currentQuestion,
  currentAnswer,
  progress,
  onRetry,
  onReviewAnswers,
  onRestart,
  onPrev,
  onNext,
  onChangeAnswer,
  isDraggingOption,
  onDragStateChange,
  isProfilingQuiz = false,
  onFinishAndContinue,
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isDraggingOption}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={16} color="#bfdbfe" />
          <Text style={styles.backBtnText}>Back to learning path</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={["#1e293b", "#0f172a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.eyebrow}>QUIZ  {formatDifficulty(difficulty)}</Text>
          <Text style={styles.title}>{lessonTitle ? `${lessonTitle} Quiz` : "Quiz"}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </LinearGradient>

        {loading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator color="#7dd3fc" />
            <Text style={styles.centerText}>Loading quiz questions...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.centerCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && !error && totalQuestions === 0 ? (
          <View style={styles.centerCard}>
            <Text style={styles.centerText}>No quiz questions found for this lesson.</Text>
          </View>
        ) : null}

        {!loading && !error && totalQuestions > 0 && finished ? (
          <View style={styles.questionCard}>
            <Text style={styles.questionTitle}>Quiz completed</Text>
            <Text style={styles.questionSummary}>
              You answered {answeredCount} out of {totalQuestions} questions.
            </Text>
            {!isProfilingQuiz && submitResult ? (
              <Text style={styles.questionSummary}>
                Score: {submitResult.total_correct}/{submitResult.total_questions} ·{" "}
                {submitResult.passed ? "Passed" : "Not passed"} · Points: {submitResult.points_awarded}
              </Text>
            ) : null}
            {isProfilingQuiz && submitResult?.assigned_difficulty ? (
              <Text style={styles.questionSummary}>
                Assigned difficulty: {formatDifficulty(submitResult.assigned_difficulty)}
              </Text>
            ) : null}
            <View style={styles.footerActions}>
              <TouchableOpacity style={[styles.navBtn, styles.secondaryBtn]} onPress={onReviewAnswers}>
                <Text style={styles.secondaryBtnText}>Review answers</Text>
              </TouchableOpacity>
              {isProfilingQuiz ? (
                <TouchableOpacity style={[styles.navBtn, styles.primaryBtn]} onPress={onFinishAndContinue}>
                  <Text style={styles.primaryBtnText}>Unlock subtopic</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.navBtn, styles.primaryBtn]} onPress={onRestart}>
                  <Text style={styles.primaryBtnText}>Restart</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : null}

        {!loading && !error && totalQuestions > 0 && !finished && currentQuestion ? (
          <View style={styles.questionCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.questionMeta}>
                Question {currentIndex + 1} of {totalQuestions}
              </Text>
              <Text style={styles.questionType}>
                {currentQuestion.type.replace(/_/g, " ")}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            {currentQuestion.scenario ? (
              <View style={styles.scenarioCard}>
                <Text style={styles.scenarioLabel}>Case Study</Text>
                <Text style={styles.scenarioText}>{currentQuestion.scenario}</Text>
              </View>
            ) : null}
            {currentQuestion.prompt ? (
              <Text style={styles.questionBody}>{currentQuestion.prompt}</Text>
            ) : null}

            <QuestionInteraction
              question={currentQuestion}
              value={currentAnswer}
              onChange={onChangeAnswer}
              onDragStateChange={onDragStateChange}
            />

            <View style={styles.footerActions}>
              <TouchableOpacity
                style={[styles.navBtn, styles.secondaryBtn, currentIndex === 0 && styles.btnDisabled]}
                onPress={onPrev}
                disabled={currentIndex === 0}
              >
                <Text style={styles.secondaryBtnText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navBtn, styles.primaryBtn, submitting && styles.btnDisabled]}
                onPress={onNext}
                disabled={submitting}
              >
                <Text style={styles.primaryBtnText}>
                  {currentIndex === totalQuestions - 1
                    ? submitting
                      ? "Submitting..."
                      : "Finish"
                    : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
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
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  backBtnText: { color: "#bfdbfe", fontSize: moderateScale(13), fontWeight: "700" },
  hero: {
    borderRadius: 20,
    padding: scale(18),
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: verticalScale(14),
  },
  eyebrow: {
    color: "#7dd3fc",
    fontSize: moderateScale(11),
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: verticalScale(6),
  },
  title: {
    color: "#e2e8f0",
    fontSize: moderateScale(24),
    fontWeight: "800",
    marginBottom: verticalScale(6),
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: moderateScale(13),
  },
  centerCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: scale(14),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(12),
  },
  centerText: {
    color: "#cbd5e1",
    fontSize: moderateScale(13),
    marginTop: verticalScale(8),
    textAlign: "center",
  },
  errorText: {
    color: "#fca5a5",
    fontSize: moderateScale(13),
    textAlign: "center",
  },
  retryBtn: {
    marginTop: verticalScale(10),
    backgroundColor: "#1e40af",
    borderRadius: 10,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
  },
  retryText: {
    color: "#dbeafe",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  questionCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: scale(14),
    marginBottom: verticalScale(12),
  },
  questionMeta: {
    color: "#93c5fd",
    fontSize: moderateScale(11),
    fontWeight: "700",
    marginBottom: verticalScale(6),
  },
  questionType: {
    color: "#94a3b8",
    fontSize: moderateScale(11),
    textTransform: "capitalize",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#1f2937",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: verticalScale(12),
  },
  progressFill: {
    height: 6,
    backgroundColor: "#22c55e",
    borderRadius: 999,
  },
  questionTitle: {
    color: "#e2e8f0",
    fontSize: moderateScale(16),
    fontWeight: "800",
    marginBottom: verticalScale(6),
  },
  questionSummary: {
    color: "#cbd5e1",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
    marginBottom: verticalScale(8),
  },
  questionBody: {
    color: "#e5e7eb",
    fontSize: moderateScale(16),
    lineHeight: moderateScale(23),
    fontWeight: "600",
    marginBottom: verticalScale(10),
  },
  scenarioCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 12,
    padding: scale(10),
    marginBottom: verticalScale(10),
  },
  scenarioLabel: {
    color: "#fbbf24",
    fontSize: moderateScale(11),
    fontWeight: "800",
    marginBottom: verticalScale(4),
  },
  scenarioText: {
    color: "#e5e7eb",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
  },
  footerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(14),
    gap: scale(10),
  },
  navBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: verticalScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtn: {
    backgroundColor: "#2563eb",
  },
  primaryBtnText: {
    color: "#eff6ff",
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
  },
  secondaryBtnText: {
    color: "#cbd5e1",
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.45,
  },
});
