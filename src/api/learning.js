import { apiFetch } from "./client";

export function fetchLessonByTopicId(topicId) {
  const path = `/lesson/${topicId}`;
  console.log(`[learning] fetching topic`, { topicId, path });
  return apiFetch(path);
}

export function fetchQuizBySubtopicAndDifficulty(subtopicId, difficulty) {
  const normalizedDifficulty = String(difficulty ?? "basic").trim().toLowerCase();
  const path = `/quiz/${subtopicId}/${normalizedDifficulty}`;
  console.log(`[learning] fetching quiz`, {
    subtopicId,
    difficulty: normalizedDifficulty,
    path,
  });
  return apiFetch(path);
}

export async function fetchAvailableTopics({ maxTopicId = 3 } = {}) {
  const ids = Array.from({ length: maxTopicId }, (_, i) => i + 1);
  console.log(`[learning] scanning topics`, {
    maxTopicId,
    totalCandidates: ids.length,
  });
  const settled = await Promise.allSettled(ids.map((id) => fetchLessonByTopicId(id)));

  const failures = settled
    .map((result, index) => ({ result, topicId: ids[index] }))
    .filter(({ result }) => result.status === "rejected")
    .map(({ result, topicId }) => ({
      topicId,
      error: result.reason?.message || String(result.reason),
    }));

  if (failures.length) {
    console.log(`[learning] failed topic fetches`, failures);
  }

  const topics = settled
    .map((result, index) => ({ result, topicId: ids[index] }))
    .filter(({ result }) => result.status === "fulfilled")
    .map(({ result, topicId }) => ({
      topic_id: result.value?.topic_id ?? topicId,
      topic_name: result.value?.topic_name ?? `Topic ${topicId}`,
      subtopics_count: Array.isArray(result.value?.subtopics) ? result.value.subtopics.length : 0,
    }));

  console.log(`[learning] topics discovered`, {
    count: topics.length,
    topicIds: topics.map((t) => t.topic_id),
  });

  return topics;
}
