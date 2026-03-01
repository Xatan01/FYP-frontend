import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchProfilingQuiz, fetchQuizBySubtopicAndDifficulty } from "../../api/learning";
import QuizContent from "./quiz_components/QuizContent";
import { formatSubtopicName, normalizeQuestion } from "./quiz_components/quizUtils";

export default function QuizDetail({ route, navigation }) {
  const {
    topicName,
    subtopicName,
    subtopicId,
    difficulty = "basic",
    lessonTitle,
    quizMode = "lesson",
    onProfilingComplete,
  } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
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
      setIsDraggingOption(false);
      setCurrentIndex(0);
      setAnswers({});

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
  }, [subtopicId, difficulty, isProfilingQuiz]);

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

  const goNext = () => {
    setIsDraggingOption(false);
    if (currentIndex >= totalQuestions - 1) {
      setFinished(true);
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
    navigation.goBack();
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
