"use client";

import {
  isQuestionProgress,
  parseQuestionProgress,
  QUESTION_PROGRESS_KEY,
  serializeQuestionProgress,
} from "@/lib/question-progress";
import { getStorageKeys, LEGACY_STORAGE_KEYS } from "@/lib/storage-keys";
import type { QuestionProgress } from "@/types/types";

type ProgressSnapshot = {
  isLoaded: boolean;
  stages: ReadonlyMap<string, QuestionProgress>;
  progressError: string;
};
type Listener = () => void;

export const EMPTY_PROGRESS_SNAPSHOT: ProgressSnapshot = {
  isLoaded: false,
  stages: new Map(),
  progressError: "",
};

const listeners = new Set<Listener>();
// Keep New as a pending deletion so failed resets survive external updates.
const pending = new Map<string, QuestionProgress>();
let snapshot = EMPTY_PROGRESS_SNAPSHOT;
let initialized = false;
let readUnavailable = false;
let migrationFailed = false;

function publish(stages: ReadonlyMap<string, QuestionProgress>) {
  snapshot = {
    isLoaded: true,
    stages,
    progressError: pending.size > 0
      ? "Some progress could not be saved in this browser. Changes apply until this page is reloaded."
      : migrationFailed
        ? "Some saved progress could not be migrated. Existing stored data has been kept."
        : readUnavailable
          ? "Some saved progress could not be read. Unreadable stages are treated as New."
          : "",
  };
  listeners.forEach((listener) => listener());
}

function readStoredProgress(storage: Storage) {
  const raw = storage.getItem(QUESTION_PROGRESS_KEY);
  const dictionary = parseQuestionProgress(raw);
  const legacyStages = new Map<string, QuestionProgress>();
  const legacyKeys: string[] = [];
  let invalidLegacy = false;
  for (const key of getStorageKeys(storage)) {
    if (!key.startsWith(LEGACY_STORAGE_KEYS.progressPrefix)) continue;
    try {
      const number = decodeURIComponent(key.slice(LEGACY_STORAGE_KEYS.progressPrefix.length));
      const value = storage.getItem(key);
      if (!number || LEGACY_STORAGE_KEYS.progressPrefix + encodeURIComponent(number) !== key || !isQuestionProgress(value)) {
        throw new Error("Invalid legacy progress");
      }
      if (value !== "new") legacyStages.set(number, value);
      legacyKeys.push(key);
    } catch {
      invalidLegacy = true;
    }
  }
  return {
    // A valid destination, including {}, is authoritative over legacy values.
    stages: raw !== null && dictionary.isValid
      ? dictionary.stages
      : new Map([...legacyStages, ...dictionary.stages]),
    hasDictionary: raw !== null,
    validDictionary: raw !== null && dictionary.isValid,
    unreadable: !dictionary.isValid || invalidLegacy,
    invalidLegacy,
    legacyKeys,
  };
}

function removeLegacyProgress(storage: Storage, keys: string[]) {
  let success = true;
  for (const key of keys) {
    try { storage.removeItem(key); } catch { success = false; }
  }
  return success;
}

function applyPending(stages: Map<string, QuestionProgress>) {
  for (const [number, progress] of pending) {
    if (progress === "new") stages.delete(number);
    else stages.set(number, progress);
  }
  return stages;
}

export function getProgressSnapshot() {
  if (!initialized && typeof window !== "undefined") {
    initialized = true;
    let stages = new Map<string, QuestionProgress>();
    try {
      const storage = window.localStorage;
      const loaded = readStoredProgress(storage);
      stages = loaded.stages;
      readUnavailable = loaded.unreadable;
      try {
        if (!loaded.hasDictionary && loaded.legacyKeys.length > 0) {
          storage.setItem(QUESTION_PROGRESS_KEY, serializeQuestionProgress(stages));
        }
        if (loaded.validDictionary || !loaded.hasDictionary) {
          migrationFailed = !removeLegacyProgress(storage, loaded.legacyKeys);
        }
      } catch {
        migrationFailed = true;
      }
    } catch {
      readUnavailable = true;
    }
    publish(stages);
  }
  return snapshot;
}

export function getQuestionProgress(number: string): QuestionProgress {
  return getProgressSnapshot().stages.get(number) ?? "new";
}

export function updateQuestionProgress(number: string, progress: QuestionProgress) {
  getProgressSnapshot();
  pending.set(number, progress);
  let stages = new Map(snapshot.stages);
  try {
    const storage = window.localStorage;
    const loaded = readStoredProgress(storage);
    stages = applyPending(loaded.stages);
    storage.setItem(QUESTION_PROGRESS_KEY, serializeQuestionProgress(stages));
    pending.clear();
    migrationFailed = !removeLegacyProgress(storage, loaded.legacyKeys);
    readUnavailable = loaded.invalidLegacy;
  } catch {
    applyPending(stages);
  }
  publish(stages);
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== null && event.key !== QUESTION_PROGRESS_KEY) return;
  try {
    const storage = window.localStorage;
    if (event.storageArea !== null && event.storageArea !== storage) return;
    // Read current storage rather than an older, queued event's payload.
    const loaded = parseQuestionProgress(storage.getItem(QUESTION_PROGRESS_KEY));
    readUnavailable = !loaded.isValid;
    publish(applyPending(loaded.stages));
  } catch {
    readUnavailable = true;
    publish(snapshot.stages);
  }
}

export function subscribeProgress(listener: Listener) {
  if (listeners.size === 0) window.addEventListener("storage", handleStorageChange);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleStorageChange);
  };
}
