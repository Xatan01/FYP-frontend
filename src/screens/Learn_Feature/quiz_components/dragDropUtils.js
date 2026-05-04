function firstNonEmptyString(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

export function normalizeComparableText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s*([,.;:])\s*/g, "$1 ")
    .replace(/\s+/g, " ")
    .replace(/[.]+$/g, "")
    .trim();
}

export function getDragDropSlotKey(pair, pairIndex) {
  return firstNonEmptyString(
    pair?.slot_key,
    pair?.slotKey,
    pair?.left_key,
    pair?.leftKey,
    pair?.left_id,
    pair?.leftId,
    pair?.id,
    pair?.key,
    pair?.left,
    `slot_${pairIndex + 1}`
  );
}

export function getDragDropLeftLabel(pair, pairIndex) {
  return firstNonEmptyString(
    pair?.left_label,
    pair?.leftLabel,
    pair?.left_text,
    pair?.leftText,
    pair?.left,
    `Item ${pairIndex + 1}`
  );
}

export function getDragDropRightValue(pair, pairIndex) {
  return firstNonEmptyString(
    pair?.right_label,
    pair?.rightLabel,
    pair?.right_text,
    pair?.rightText,
    pair?.right_value,
    pair?.rightValue,
    pair?.right,
    `Option ${pairIndex + 1}`
  );
}

export function getDragDropSlots(question) {
  const pairs = Array.isArray(question?.dragDrop?.pairs) ? question.dragDrop.pairs : [];
  return pairs.map((pair, pairIndex) => ({
    pair,
    pairIndex,
    slotKey: getDragDropSlotKey(pair, pairIndex),
    leftLabel: getDragDropLeftLabel(pair, pairIndex),
    rightValue: getDragDropRightValue(pair, pairIndex),
  }));
}

export function getDragDropOptionBank(question) {
  return [...new Set(getDragDropSlots(question).map((slot) => slot.rightValue))].filter(Boolean);
}

function buildDragDropAliases(question) {
  const slotAliasToKey = {};
  const valueAliasToCanonical = {};
  const valueCanonicalToDisplay = {};
  const slotKeyToLabel = {};

  const addAlias = (target, alias, canonical) => {
    const normalizedAlias = normalizeComparableText(alias);
    if (normalizedAlias && canonical) {
      target[normalizedAlias] = canonical;
    }
  };

  getDragDropSlots(question).forEach(({ pair, slotKey, leftLabel, rightValue }) => {
    const canonicalValue = normalizeComparableText(rightValue);
    slotKeyToLabel[slotKey] = leftLabel;
    valueCanonicalToDisplay[canonicalValue] = rightValue;

    [
      slotKey,
      leftLabel,
      pair?.slot_key,
      pair?.slotKey,
      pair?.left_key,
      pair?.leftKey,
      pair?.left_id,
      pair?.leftId,
      pair?.id,
      pair?.key,
      pair?.left,
    ]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
      .forEach((alias) => addAlias(slotAliasToKey, alias, slotKey));

    [
      rightValue,
      pair?.right_label,
      pair?.rightLabel,
      pair?.right_text,
      pair?.rightText,
      pair?.right_value,
      pair?.rightValue,
      pair?.right,
    ]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
      .forEach((alias) => addAlias(valueAliasToCanonical, alias, canonicalValue));
  });

  return {
    slotAliasToKey,
    slotKeyToLabel,
    valueAliasToCanonical,
    valueCanonicalToDisplay,
  };
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseDragDropAnswerString(question, raw) {
  const text = String(raw ?? "").trim();
  if (!text) return {};

  if (text.startsWith("{") && text.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {}
  }

  const slots = getDragDropSlots(question);
  const labelEntries = slots
    .map((slot) => ({ leftLabel: slot.leftLabel, slotKey: slot.slotKey }))
    .filter((entry) => entry.leftLabel)
    .sort((a, b) => b.leftLabel.length - a.leftLabel.length);

  if (labelEntries.length) {
    const labelPattern = labelEntries.map(({ leftLabel }) => escapeRegExp(leftLabel)).join("|");
    const matcher = new RegExp(`(${labelPattern})\\s*(?:->|:|-)\\s*`, "gi");
    const matches = Array.from(text.matchAll(matcher));

    if (matches.length) {
      const parsed = {};
      matches.forEach((match, index) => {
        const matchedLabel = normalizeComparableText(match[1]);
        const entry = labelEntries.find(
          ({ leftLabel }) => normalizeComparableText(leftLabel) === matchedLabel
        );
        if (!entry) return;

        const valueStart = match.index + match[0].length;
        const valueEnd = index + 1 < matches.length ? matches[index + 1].index : text.length;
        const rawValue = text
          .slice(valueStart, valueEnd)
          .replace(/^[,\s]+/, "")
          .replace(/[,\s]+$/g, "")
          .trim();

        if (rawValue) {
          parsed[entry.slotKey] = rawValue;
        }
      });

      if (Object.keys(parsed).length) {
        return parsed;
      }
    }
  }

  return text
    .split(/\s*\|\s*/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .reduce((acc, segment) => {
      const dividerMatch = segment.match(/\s*(->|:|-)\s*/);
      if (!dividerMatch) return acc;

      const dividerIndex = dividerMatch.index ?? -1;
      const left = segment.slice(0, dividerIndex).trim();
      const right = segment.slice(dividerIndex + dividerMatch[0].length).trim();

      if (left && right) {
        acc[left] = right;
      }
      return acc;
    }, {});
}

function parsePositionalDragDropAnswer(question, raw) {
  const text = String(raw ?? "").trim();
  const slots = getDragDropSlots(question);
  if (!text || !slots.length) return {};

  const values = text
    .split(/\s*,\s*/)
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.length !== slots.length) {
    return {};
  }

  return slots.reduce((acc, slot, index) => {
    acc[slot.slotKey] = values[index];
    return acc;
  }, {});
}

function flattenDragDropAnswer(question, answer) {
  if (answer === null || answer === undefined || answer === "") {
    return {};
  }

  if (typeof answer === "string") {
    const parsed = parseDragDropAnswerString(question, answer);
    if (Object.keys(parsed).length) {
      return parsed;
    }
    return parsePositionalDragDropAnswer(question, answer);
  }

  if (Array.isArray(answer)) {
    return answer.reduce((acc, item, index) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const rawSlot = item.left ?? item.slot ?? item.key ?? item.id;
        const rawValue =
          item.right ?? item.value ?? item.answer ?? item.selected ?? item.label;

        if (rawSlot !== undefined && rawValue !== undefined) {
          acc[String(rawSlot)] = rawValue;
          return acc;
        }

        Object.assign(acc, item);
        return acc;
      }

      acc[`slot_${index + 1}`] = item;
      return acc;
    }, {});
  }

  return answer && typeof answer === "object" ? answer : {};
}

export function normalizeDragDropAnswer(question, answer) {
  const {
    slotAliasToKey,
    slotKeyToLabel,
    valueAliasToCanonical,
  } = buildDragDropAliases(question);

  if (!Object.keys(slotAliasToKey).length) {
    return {};
  }

  const source = flattenDragDropAnswer(question, answer);
  const normalized = {};

  Object.entries(source).forEach(([rawSlot, rawValue]) => {
    const slotKey = slotAliasToKey[normalizeComparableText(rawSlot)];
    const canonicalValue =
      valueAliasToCanonical[normalizeComparableText(rawValue)] || normalizeComparableText(rawValue);

    if (!slotKey || !slotKeyToLabel[slotKey] || !canonicalValue) {
      return;
    }

    normalized[slotKey] = canonicalValue;
  });

  return Object.keys(normalized)
    .sort()
    .reduce((acc, key) => {
      acc[key] = normalized[key];
      return acc;
    }, {});
}

export function getDragDropCorrectAnswer(question) {
  const slots = getDragDropSlots(question);
  if (slots.length) {
    return slots.reduce((acc, slot) => {
      acc[slot.slotKey] = slot.rightValue;
      return acc;
    }, {});
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

export function isDragDropAnswerComplete(question, answer) {
  const slots = getDragDropSlots(question);
  if (!slots.length) return false;

  const normalized = normalizeDragDropAnswer(question, answer);
  return slots.every((slot) => Boolean(normalized[slot.slotKey]));
}

export function areDragDropAnswersEqual(question, firstAnswer, secondAnswer) {
  const first = normalizeDragDropAnswer(question, firstAnswer);
  const second = normalizeDragDropAnswer(question, secondAnswer);
  return JSON.stringify(first) === JSON.stringify(second);
}

export function formatDragDropAnswerPairs(question, answer) {
  const slots = getDragDropSlots(question);
  const normalized = normalizeDragDropAnswer(question, answer);
  const { valueCanonicalToDisplay } = buildDragDropAliases(question);

  return slots.map((slot) => {
    const canonicalValue = normalized[slot.slotKey] || "";
    return {
      slotKey: slot.slotKey,
      leftLabel: slot.leftLabel,
      value: valueCanonicalToDisplay[canonicalValue] || canonicalValue || "",
      isFilled: Boolean(canonicalValue),
    };
  });
}

export function formatDragDropAnswerText(question, answer, emptyText = "No answer selected") {
  const pairs = formatDragDropAnswerPairs(question, answer).filter((pair) => pair.isFilled);
  if (!pairs.length) {
    return emptyText;
  }

  return pairs.map((pair) => `${pair.leftLabel} -> ${pair.value}`).join(" | ");
}
