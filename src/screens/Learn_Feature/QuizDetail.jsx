import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchProfilingQuiz,
  fetchQuizBySubtopicAndDifficulty,
  initializeSubtopicProgress,
  submitProfilingQuiz,
  submitQuizBySubtopicAndDifficulty,
} from "../../api/learning";
import QuizContent from "./quiz_components/QuizContent";
import { formatSubtopicName, normalizeQuestion } from "./quiz_components/quizUtils";

export default function QuizDetail({ route, navigation }) {
  const {
    topicName,
    topicId,
    subtopicName,
    subtopicId,
    difficulty = "basic",
    lessonTitle,
    quizMode = "lesson",
    onProfilingComplete,
    onQuizPassed,
  } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [isDraggingOption, setIsDraggingOption] = useState(false);
  const isProfilingQuiz = String(quizMode).trim().toLowerCase() === "profiling";

  const subtitle = useMemo(() => {
    const topic = topicName ? String(topicName).trim() : "";
    const subtopic = formatSubtopicName(subtopicName);
    return [topic, subtopic].filter(Boolean).join(" - ");
  }, [topicName, subtopicName]);

  const loadQuiz = useCallback(async () => {
    if (!subtopicId) {
      setError("Missing subtopic id. Cannot load quiz.");
      setQuestions([]);
      setIsDraggingOption(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFinished(false);
      setSubmitting(false);
      setSubmitResult(null);
      setIsDraggingOption(false);
      setCurrentIndex(0);
      setAnswers({});

      if (topicId && subtopicId) {
        await initializeSubtopicProgress(topicId, subtopicId);
      }

      const data = isProfilingQuiz
        ? await fetchProfilingQuiz(subtopicId)
        : await fetchQuizBySubtopicAndDifficulty(subtopicId, difficulty);
      const normalized = Array.isArray(data) ? data.map(normalizeQuestion) : [];
      setQuestions(normalized);
    } catch (err) {
      setQuestions([]);
      setError(err?.message || "Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  }, [subtopicId, difficulty, isProfilingQuiz, topicId]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const handleChangeAnswer = (value) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (totalQuestions === 0) return;

    if (answeredCount < totalQuestions) {
      setError("Please answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = { ...answers };
      const result = isProfilingQuiz
        ? await submitProfilingQuiz(subtopicId, payload)
        : await submitQuizBySubtopicAndDifficulty(subtopicId, difficulty, payload);

      if (!isProfilingQuiz && result?.passed && typeof onQuizPassed === "function") {
        await Promise.resolve(onQuizPassed());
      }

      setSubmitResult(result || null);
      setFinished(true);
    } catch (err) {
      setError(err?.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  }, [
    answers,
    answeredCount,
    difficulty,
    isProfilingQuiz,
    onQuizPassed,
    subtopicId,
    submitting,
    totalQuestions,
  ]);

  const goNext = async () => {
    if (submitting) return;
    setIsDraggingOption(false);
    if (currentIndex >= totalQuestions - 1) {
      await handleSubmit();
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const goPrev = () => {
    setIsDraggingOption(false);
    if (currentIndex <= 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const reviewAnswers = () => {
    setIsDraggingOption(false);
    setFinished(false);
    setCurrentIndex(0);
  };

  const handleFinishAndContinue = async () => {
    if (typeof onProfilingComplete === "function") {
      await Promise.resolve(onProfilingComplete());
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("MainTabs", {
      screen: "Learn",
      params: {
        refreshTopicId: topicId,
        refreshAt: Date.now(),
      },
    });
  };

  return (
    <QuizContent
      navigation={navigation}
      difficulty={difficulty}
      lessonTitle={lessonTitle}
      subtitle={subtitle}
      loading={loading}
      error={error}
      totalQuestions={totalQuestions}
      finished={finished}
      submitting={submitting}
      submitResult={submitResult}
      answeredCount={answeredCount}
      currentIndex={currentIndex}
      currentQuestion={currentQuestion}
      currentAnswer={currentAnswer}
      progress={progress}
      onRetry={loadQuiz}
      onReviewAnswers={reviewAnswers}
      onRestart={loadQuiz}
      onPrev={goPrev}
      onNext={goNext}
      onChangeAnswer={handleChangeAnswer}
      isDraggingOption={isDraggingOption}
      onDragStateChange={setIsDraggingOption}
      isProfilingQuiz={isProfilingQuiz}
      onFinishAndContinue={handleFinishAndContinue}
    />
  );
}
