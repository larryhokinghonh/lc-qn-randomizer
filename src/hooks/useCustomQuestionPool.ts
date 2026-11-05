"use client";

import { useMemo, useSyncExternalStore } from "react";

import { parseCustomQuestionPool, resolveCustomQuestions } from "@/lib/custom-question-pool";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Question } from "@/types/types";

type PoolSnapshot = {
  isLoaded: boolean;
  numbers: string[];
  storageError: string;
};

const SERVER_SNAPSHOT: PoolSnapshot = { isLoaded: false, numbers: [], storageError: "" };
const LAYOUT_QUERY = "(min-width: 640px)";
const listeners = new Set<() => void>();
let snapshot = SERVER_SNAPSHOT;

function getSnapshot() {
  if (!snapshot.isLoaded) {
    try {
      snapshot = {
        isLoaded: true,
        numbers: parseCustomQuestionPool(window.localStorage.getItem(STORAGE_KEYS.customPool)),
        storageError: "",
      };
    } catch {
      snapshot = {
        isLoaded: true,
        numbers: [],
        storageError: "Your saved question list could not be read in this browser.",
      };
    }
  }
  return snapshot;
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== STORAGE_KEYS.customPool && event.key !== null) return;
  if (snapshot.storageError) return;
  snapshot = SERVER_SNAPSHOT;
  getSnapshot();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleStorageChange);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleStorageChange);
  };
}

function saveNumbers(numbers: string[]) {
  let storageError = "";
  try {
    window.localStorage.setItem(STORAGE_KEYS.customPool, JSON.stringify(numbers));
  } catch {
    storageError = "Your question list could not be saved. Changes apply until this page is reloaded.";
  }
  snapshot = { isLoaded: true, numbers, storageError };
  listeners.forEach((listener) => listener());
}

function addQuestion(number: string) {
  const { numbers } = getSnapshot();
  if (!number.trim() || numbers.includes(number)) return;
  saveNumbers([...numbers, number]);
}

function removeQuestion(number: string) {
  saveNumbers(getSnapshot().numbers.filter((current) => current !== number));
}

function subscribeLayout(listener: () => void) {
  const query = window.matchMedia(LAYOUT_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

const getLayout = () => window.matchMedia(LAYOUT_QUERY).matches;
const getServerLayout = () => false;
const getServerSnapshot = () => SERVER_SNAPSHOT;

export function useCustomQuestionPool(questions: Question[]) {
  const { numbers, isLoaded, storageError } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isTabletOrDesktop = useSyncExternalStore(subscribeLayout, getLayout, getServerLayout);
  const customQuestions = useMemo(() => resolveCustomQuestions(questions, numbers), [questions, numbers]);

  return { addQuestion, removeQuestion, customQuestions, isLoaded, isTabletOrDesktop, storageError };
}
