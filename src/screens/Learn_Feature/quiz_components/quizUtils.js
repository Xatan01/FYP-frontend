import {
  getDragDropLeftLabel,
  getDragDropRightValue,
  getDragDropSlotKey,
  isDragDropAnswerComplete,
} from "./dragDropUtils";

export function formatSubtopicName(name = "") {
  const cleaned = String(name).replace(/_/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function formatDifficulty(difficulty = "") {
  const normalized = String(difficulty).replace(/_/g, " ").trim().toLowerCase();
  if (!normalized) return "Basic";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function sanitizeQuestionText(value = "") {
  return String(value ?? "")
    .replace(/^\s*question\s*\d+\s*[:.-]?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isGeneratedQuestionLabel(value = "", questionId = "", index = 0) {
  const text = String(value ?? "").trim();
  if (!text) return true;

  if (/^question\s*\d+\s*$/i.test(text)) {
    return true;
  }

  const idText = String(questionId ?? "").trim();
  if (idText && text.toLowerCase() === idText.toLowerCase()) {
    return true;
  }

  return text.toLowerCase() === `question ${index + 1}`;
}

function normalizeType(type = "") {
  const value = String(type).trim().toLowerCase();
  if (value === "true_false") return "true_false";
  if (value === "case_study_mcq") return "case_study_mcq";
  if (value === "fill_blank_mcq") return "fill_blank_mcq";
  if (value === "drag_drop") return "drag_drop";
  return "mcq";
}

function parseOptions(rawOptions) {
  if (!Array.isArray(rawOptions) || rawOptions.length === 0) return [];

  const normalizePairKey = (value) => String(value ?? "").trim().toUpperCase();
  const isLikelyPairKey = (value) => {
    if (typeof value !== "string") return false;
    const trimmed = value.trim();
    return /^[A-Za-z0-9]{1,4}$/.test(trimmed);
  };

  // Supports option strings like "A. demand" / "B) profit".
  const parseLabeledStringOption = (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    const match = trimmed.match(/^([A-Za-z0-9])[\.\)]\s*(.+)$/);
    if (!match) return null;
    return { key: match[1].toUpperCase(), text: match[2].trim() };
  };

  const parsedLabeled = rawOptions.map(parseLabeledStringOption);
  if (parsedLabeled.every(Boolean)) {
    return parsedLabeled;
  }

  const canPair = rawOptions.length % 2 === 0;
  const looksLikePairedShape =
    canPair &&
    rawOptions.every((option, index) =>
      index % 2 === 0 ? isLikelyPairKey(option) : typeof option === "string"
    );

  if (looksLikePairedShape) {
    const pairs = [];
    for (let i = 0; i < rawOptions.length; i += 2) {
      const key = rawOptions[i];
      const text = rawOptions[i + 1];
      if (typeof key !== "string" || typeof text !== "string") return [];
      pairs.push({ key: normalizePairKey(key), text: text.trim() });
    }
    return pairs;
  }

  return rawOptions.map((option, index) => {
    const label = String.fromCharCode(65 + (index % 26));
    const text = typeof option === "string" ? option.trim() : String(option ?? "");
    return { key: label, text };
  });
}

export function isQuestionAnswered(question, answer) {
  if (!question) return false;

  if (question.type === "drag_drop") {
    return isDragDropAnswerComplete(question, answer);
  }

  if (typeof answer === "boolean") return true;
  if (typeof answer === "string") return answer.trim().length > 0;
  if (Array.isArray(answer)) return answer.length > 0;

  return answer !== null && answer !== undefined;
}

export { getDragDropLeftLabel, getDragDropRightValue, getDragDropSlotKey };

export function normalizeQuestion(raw, index) {
  const questionJson =
    raw?.question_json && typeof raw.question_json === "object" ? raw.question_json : {};
  const qType = normalizeType(questionJson.type || raw?.question_type);
  const options = parseOptions(questionJson.options);
  const dragDrop =
    questionJson.drag_drop && typeof questionJson.drag_drop === "object"
      ? questionJson.drag_drop
      : { pairs: [] };
  const rawTitle = typeof raw?.title === "string" ? raw.title : "";
  const rawPrompt =
    (typeof questionJson.question === "string" && questionJson.question.trim()) ||
    raw?.summary ||
    "";
  const questionId = String(raw?.question_id ?? `q-${index}`);

  return {
    id: questionId,
    type: qType,
    title: isGeneratedQuestionLabel(rawTitle, questionId, index) ? "" : sanitizeQuestionText(rawTitle),
    prompt: sanitizeQuestionText(rawPrompt),
    scenario:
      typeof questionJson.scenario === "string" ? questionJson.scenario.trim() : "",
    options,
    dragDrop,
    questionJson,
  };
}
