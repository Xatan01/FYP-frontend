import { apiFetch } from "./client";

export function generateInference(prompt, model = "finetuned") {
  return apiFetch("/generate", {
    method: "POST",
    body: {
      prompt,
      model,
    },
  });
}
