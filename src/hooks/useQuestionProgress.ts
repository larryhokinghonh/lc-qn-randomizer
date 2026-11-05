"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  EMPTY_PROGRESS_SNAPSHOT,
  getProgressSnapshot,
  getQuestionProgress,
  subscribeProgress,
} from "@/lib/question-progress-store";
import type { QuestionProgress } from "@/types/types";

export function useQuestionProgressStatus() {
  return useSyncExternalStore(subscribeProgress, getProgressSnapshot, () => EMPTY_PROGRESS_SNAPSHOT);
}

export function useQuestionProgress(number: string) {
  const getSnapshot = useCallback(() => getQuestionProgress(number), [number]);
  return useSyncExternalStore(subscribeProgress, getSnapshot, (): QuestionProgress => "new");
}
