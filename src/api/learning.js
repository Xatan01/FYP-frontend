import { apiFetch } from "./client";

export function fetchLearningPath() {
  return apiFetch("/api/learning-path");
}

export function completeLesson(lessonId) {
  return apiFetch("/api/lessons/complete", { method: "POST", body: { lesson_id: lessonId } });
}
