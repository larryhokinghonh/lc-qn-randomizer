"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  EMPTY_NOTES_STATUS,
  getNotesStatus,
  getQuestionNote,
  subscribeNotesStatus,
  subscribeQuestionNote,
  updateQuestionNote,
} from "@/lib/question-notes-store";
import type { Question } from "@/types/types";

export function useQuestionNotesStatus() {
  return useSyncExternalStore(subscribeNotesStatus, getNotesStatus, () => EMPTY_NOTES_STATUS);
}

export function useQuestionNote(question: Question) {
  const number = question.question_number;
  const subscribe = useCallback((listener: () => void) => subscribeQuestionNote(number, listener), [number]);
  const getSnapshot = useCallback(() => getQuestionNote(number), [number]);
  const text = useSyncExternalStore(subscribe, getSnapshot, () => "");
  return { text, setText: (value: string) => updateQuestionNote(question, value) };
}
