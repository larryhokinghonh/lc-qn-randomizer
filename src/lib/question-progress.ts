import type { Question, QuestionProgress } from "@/types/types";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export const QUESTION_PROGRESS_KEY = STORAGE_KEYS.progress;
export const QUESTION_PROGRESS_LABELS = {
  new: "New",
  attempted: "Attempted",
  solved: "Solved",
} satisfies Record<QuestionProgress, string>;

export function isQuestionProgress(value: unknown): value is QuestionProgress {
  return value === "new" || value === "attempted" || value === "solved";
}

export function parseQuestionProgress(raw: string | null) {
  const stages = new Map<string, QuestionProgress>();
  if (raw === null) return { stages, isValid: true };
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return { stages, isValid: false };
    let isValid = true;
    for (const [number, progress] of Object.entries(value)) {
      if (!number || !isQuestionProgress(progress)) isValid = false;
      else if (progress !== "new") stages.set(number, progress);
    }
    return { stages, isValid };
  } catch {
    return { stages, isValid: false };
  }
}

export function serializeQuestionProgress(stages: ReadonlyMap<string, QuestionProgress>) {
  return JSON.stringify(Object.fromEntries(stages));
}

export function getEligibleQuestions(
  questions: Question[],
  progress: ReadonlyMap<string, QuestionProgress>,
) {
  return questions.filter((question) => progress.get(question.question_number) !== "solved");
}
