import {
  areDragDropAnswersEqual,
  formatDragDropAnswerText,
  getDragDropCorrectAnswer,
  normalizeDragDropAnswer,
} from "./dragDropUtils";

const OPTION_PATTERN = /^\s*([A-Za-z0-9])[\.\)]\s*(.+?)\s*$/;

export const QUIZ_REVIEW_STORAGE_KEY = "learningQuizReviewV1";

const ANSWER_REVIEW_UNITS = new Set(["1.1"]);
const ANSWER_REVIEW_DIFFICULTIES = new Set(["basic", "core", "mastery"]);

const EXPLANATION_LIBRARY = {
  basic: [
    "Unit 1.1 basic is about nailing the foundation first. The safest explanation is to tie the answer back to what a stock represents for an investor.",
    "This basic-level question works best when you explain the plain-language meaning before getting into market jargon.",
    "Keep this explanation simple and ownership-focused so the concept is immediately clear.",
  ],
  core: [
    "At the core tier, the explanation should connect the answer to how stock ideas behave in a realistic investing context.",
    "This core question lands best when you show the logic behind the answer instead of treating it like a memorisation check.",
    "Frame this as a concept-application question where the right answer fits how investors interpret stocks in practice.",
  ],
  mastery: [
    "At the advanced tier, the explanation should sound more analytical and show why the correct answer is the strongest interpretation.",
    "This advanced question is a good moment to explain not just what is right, but why that answer holds up better than the alternatives.",
    "Use a sharper investor mindset here and connect the answer to decision-making rather than just definitions.",
  ],
};

export function normalizeQuizDifficulty(difficulty = "") {
  const normalized = String(difficulty).trim().toLowerCase();
  if (normalized === "advanced" || normalized === "mastery") return "mastery";
  if (normalized === "core") return "core";
  return "basic";
}

export function formatReviewDifficulty(difficulty = "") {
  const normalized = normalizeQuizDifficulty(difficulty);
  if (normalized === "mastery") return "Advanced";
  if (normalized === "core") return "Core";
  return "Basic";
}

export function buildQuizReviewKey(subtopicId, difficulty = "") {
  return `${String(subtopicId ?? "").trim()}:${normalizeQuizDifficulty(difficulty)}`;
}

export function createDefaultQuizReviewState() {
  return {
    latestByKey: {},
  };
}

export function normalizeQuizReviewState(value) {
  const base = value && typeof value === "object" ? value : {};
  const latestByKey =
    base.latestByKey && typeof base.latestByKey === "object" ? base.latestByKey : {};

  return {
    latestByKey: { ...latestByKey },
  };
}

export function isAnswerReviewEnabled(unitLabel, difficulty = "") {
  return (
    ANSWER_REVIEW_UNITS.has(String(unitLabel ?? "").trim()) &&
    ANSWER_REVIEW_DIFFICULTIES.has(normalizeQuizDifficulty(difficulty))
  );
}

function getQuestionCorrectValue(question) {
  if (question?.type === "drag_drop") {
    return getDragDropCorrectAnswer(question);
  }

  const questionJson =
    question?.questionJson && typeof question.questionJson === "object" ? question.questionJson : {};

  for (const key of ["answer", "correct_answer", "correctAnswer", "correct", "answers"]) {
    if (questionJson[key] !== undefined && questionJson[key] !== null) {
      return questionJson[key];
    }
  }

  return null;
}

function buildOptionMaps(options = []) {
  const textToKey = {};
  const bodyToKey = {};

  if (!Array.isArray(options)) {
    return { textToKey, bodyToKey };
  }

  options.forEach((option) => {
    if (!option) return;

    if (typeof option === "string") {
      const cleaned = option.trim();
      if (!cleaned) return;
      const match = OPTION_PATTERN.exec(cleaned);
      if (match) {
        const key = match[1].toUpperCase();
        const body = match[2].trim();
        textToKey[cleaned.toLowerCase()] = key;
        bodyToKey[body.toLowerCase()] = key;
      } else {
        textToKey[cleaned.toLowerCase()] = cleaned;
      }
      return;
    }

    if (typeof option === "object") {
      const key = String(option.key ?? "").trim().toUpperCase();
      const text = String(option.text ?? "").trim();
      if (!key && !text) return;

      if (key) {
        textToKey[key.toLowerCase()] = key;
      }
      if (text) {
        textToKey[text.toLowerCase()] = key || text;
        bodyToKey[text.toLowerCase()] = key;
      }
      if (key && text) {
        textToKey[`${key}. ${text}`.toLowerCase()] = key;
        textToKey[`${key}) ${text}`.toLowerCase()] = key;
      }
    }
  });

  return { textToKey, bodyToKey };
}

function valueToTokens(value, optionTextToKey, optionBodyToKey) {
  const tokens = new Set();

  if (Array.isArray(value)) {
    value.forEach((item) => {
      valueToTokens(item, optionTextToKey, optionBodyToKey).forEach((token) => tokens.add(token));
    });
    return tokens;
  }

  if (value && typeof value === "object") {
    const specialKeys = ["answer", "value", "selected", "option", "label"];
    const hasSpecialKey = specialKeys.some((key) => Object.prototype.hasOwnProperty.call(value, key));
    if (hasSpecialKey) {
      specialKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          valueToTokens(value[key], optionTextToKey, optionBodyToKey).forEach((token) =>
            tokens.add(token)
          );
        }
      });
    }
    return tokens;
  }

  if (value === null || value === undefined) {
    return tokens;
  }

  const text = String(value).trim();
  if (!text) return tokens;

  const lowered = text.toLowerCase();
  tokens.add(`T:${lowered}`);

  if (text.length === 1 && /[A-Za-z0-9]/.test(text)) {
    tokens.add(`K:${text.toUpperCase()}`);
  }

  const match = OPTION_PATTERN.exec(text);
  if (match) {
    tokens.add(`K:${match[1].toUpperCase()}`);
    tokens.add(`T:${match[2].trim().toLowerCase()}`);
  }

  if (optionTextToKey[lowered]) {
    const mapped = optionTextToKey[lowered];
    if (mapped.length === 1 && /[A-Za-z0-9]/.test(mapped)) {
      tokens.add(`K:${mapped.toUpperCase()}`);
    } else {
      tokens.add(`T:${mapped.toLowerCase()}`);
    }
  }

  if (optionBodyToKey[lowered]) {
    tokens.add(`K:${String(optionBodyToKey[lowered]).toUpperCase()}`);
  }

  return tokens;
}

function normalizeStructuredAnswer(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeStructuredAnswer(item));
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[String(key).trim().toLowerCase()] = normalizeStructuredAnswer(value[key]);
        return acc;
      }, {});
  }

  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }

  return value;
}

function isStructuredAnswerCorrect(question, selectedAnswer, correctAnswer) {
  if (!selectedAnswer || !correctAnswer) return false;

  if (question?.type === "drag_drop") {
    return areDragDropAnswersEqual(question, selectedAnswer, correctAnswer);
  }

  return (
    JSON.stringify(normalizeStructuredAnswer(selectedAnswer)) ===
    JSON.stringify(normalizeStructuredAnswer(correctAnswer))
  );
}

export function isAnswerCorrect(question, selectedAnswer) {
  const correctAnswer = getQuestionCorrectValue(question);
  if (correctAnswer === null || correctAnswer === undefined) {
    return false;
  }

  const isStructured =
    (selectedAnswer && typeof selectedAnswer === "object") ||
    (correctAnswer && typeof correctAnswer === "object");
  if (isStructured) {
    return isStructuredAnswerCorrect(question, selectedAnswer, correctAnswer);
  }

  const { textToKey, bodyToKey } = buildOptionMaps(question?.options || []);
  const selectedTokens = valueToTokens(selectedAnswer, textToKey, bodyToKey);
  const correctTokens = valueToTokens(correctAnswer, textToKey, bodyToKey);

  if (!selectedTokens.size || !correctTokens.size) {
    return false;
  }

  return Array.from(selectedTokens).some((token) => correctTokens.has(token));
}

function formatOptionDisplay(question, value) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const options = Array.isArray(question?.options) ? question.options : [];
  const match = options.find((option) => {
    const key = String(option?.key ?? "").trim().toUpperCase();
    const optionText = String(option?.text ?? "").trim();
    const lowered = text.toLowerCase();
    return (
      lowered === key.toLowerCase() ||
      lowered === optionText.toLowerCase() ||
      lowered === `${key}. ${optionText}`.toLowerCase() ||
      lowered === `${key}) ${optionText}`.toLowerCase()
    );
  });

  if (match?.key && match?.text) {
    return `${match.key}. ${match.text}`;
  }

  return text;
}

export function formatAnswerForDisplay(question, value) {
  if (value === null || value === undefined || value === "") {
    return "No answer selected";
  }

  if (question?.type === "drag_drop") {
    return formatDragDropAnswerText(question, value);
  }

  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatAnswerForDisplay(question, item)).join(", ");
  }

  if (value && typeof value === "object") {
    const specialKeys = ["answer", "value", "selected", "option", "label"];
    const specialKey = specialKeys.find((key) => Object.prototype.hasOwnProperty.call(value, key));
    if (specialKey) {
      return formatAnswerForDisplay(question, value[specialKey]);
    }

    return Object.entries(value)
      .map(([left, right]) => `${String(left)} -> ${formatAnswerForDisplay(question, right)}`)
      .join(" | ");
  }

  return formatOptionDisplay(question, value);
}

export function getCorrectAnswerText(question) {
  return formatAnswerForDisplay(question, getQuestionCorrectValue(question));
}

export function buildQuizExplanation({ difficulty, questionIndex, correctAnswerText, isCorrect }) {
  const normalizedDifficulty = normalizeQuizDifficulty(difficulty);
  const explanationSet = EXPLANATION_LIBRARY[normalizedDifficulty] || EXPLANATION_LIBRARY.basic;
  const opener = explanationSet[questionIndex % explanationSet.length];
  const outcome = isCorrect
    ? "Your answer matches that takeaway, so you are reading the concept the right way."
    : "This is the main idea to emphasize when explaining why the correct answer is stronger.";

  return `${opener} The best answer here is ${correctAnswerText}. ${outcome}`;
}

export function buildQuizReviewEntry({
  unitLabel,
  topicId,
  topicName,
  subtopicId,
  subtopicName,
  difficulty,
  lessonTitle,
  questions,
  answers,
  submitResult,
}) {
  const normalizedDifficulty = normalizeQuizDifficulty(difficulty);

  return {
    unitLabel: String(unitLabel ?? "").trim(),
    topicId,
    topicName: topicName ?? "",
    subtopicId,
    subtopicName: subtopicName ?? "",
    difficulty: normalizedDifficulty,
    lessonTitle: lessonTitle ?? "",
    attemptNumber: Number(submitResult?.attempt_number || 0),
    passed: submitResult?.passed === true,
    totalCorrect: Number(submitResult?.total_correct || 0),
    totalQuestions: Number(submitResult?.total_questions || questions?.length || 0),
    completedAt: new Date().toISOString(),
    questions: Array.isArray(questions)
      ? questions.map((question) => ({
          id: question?.id ?? "",
          type: question?.type ?? "mcq",
          title: question?.title ?? "",
          prompt: question?.prompt ?? "",
          scenario: question?.scenario ?? "",
          options: Array.isArray(question?.options) ? question.options : [],
          dragDrop:
            question?.dragDrop && typeof question.dragDrop === "object" ? question.dragDrop : { pairs: [] },
          questionJson:
            question?.questionJson && typeof question.questionJson === "object" ? question.questionJson : {},
          selectedAnswer:
            question?.type === "drag_drop"
              ? normalizeDragDropAnswer(question, answers ? answers[question.id] : undefined)
              : answers
                ? answers[question.id]
                : undefined,
        }))
      : [],
  };
}
