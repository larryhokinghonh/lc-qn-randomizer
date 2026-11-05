"use client";

import { useEffect, useState } from "react";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";

import type {
  CounterResponse,
  Question,
  QuestionsResponse,
} from "@/types/types";

const QUESTIONS_CACHE_KEY = STORAGE_KEYS.questions;
const QUESTIONS_SYNCED_AT_CACHE_KEY = STORAGE_KEYS.syncedAt;
const QUESTIONS_CACHE_VERSION_KEY = STORAGE_KEYS.questionsVersion;

// Increase this value when users' cache needs a full update
const QUESTIONS_CACHE_VERSION = "2";
const DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isQuestion(value: unknown): value is Question {
  if (!value || typeof value !== "object") {
    return false;
  }

  const question = value as Record<string, unknown>;

  return (
    typeof question.name === "string" &&
    typeof question.question_number === "string" &&
    isStringArray(question.topics) &&
    typeof question.difficulty === "string" &&
    DIFFICULTIES.has(question.difficulty) &&
    typeof question.url === "string" &&
    typeof question.needs_premium === "boolean" &&
    isStringArray(question.special_topics)
  );
}

function isValidTimestamp(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

function isQuestionsResponse(value: unknown): value is QuestionsResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    Array.isArray(response.questions) &&
    response.questions.every(isQuestion) &&
    isValidTimestamp(response.synced_at)
  );
}

function isCounterResponse(value: unknown): value is CounterResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.spin_count === "number" &&
    Number.isSafeInteger(response.spin_count) &&
    response.spin_count >= 0
  );
}

type QuestionCacheKeys = { questions: string; syncedAt: string; questionsVersion: string };

function clearQuestionCache(keys: QuestionCacheKeys = STORAGE_KEYS) {
  try {
    window.localStorage.removeItem(keys.questions);
    window.localStorage.removeItem(keys.syncedAt);
    window.localStorage.removeItem(keys.questionsVersion);
  } catch {
    return;
  }
}

function readQuestionCache(storage: Storage, keys: QuestionCacheKeys) {
  const cachedQuestions = storage.getItem(keys.questions);
  const cachedSyncedAt = storage.getItem(keys.syncedAt);
  const version = storage.getItem(keys.questionsVersion);
  try {
    if (!cachedQuestions || !cachedSyncedAt) return null;

    const questions: unknown = JSON.parse(cachedQuestions);

    if (
      !Array.isArray(questions) ||
      !questions.every(isQuestion) ||
      !isValidTimestamp(cachedSyncedAt)
    ) {
      return null;
    }

    return {
      questions,
      syncedAt: cachedSyncedAt,
      requiresFullRefresh:
        version !== QUESTIONS_CACHE_VERSION,
    };
  } catch {
    return null;
  }
}

function getCachedQuestions() {
  try {
    const storage = window.localStorage;
    const current = readQuestionCache(storage, STORAGE_KEYS);
    if (current) {
      clearQuestionCache(LEGACY_STORAGE_KEYS);
      return current;
    }
    const legacy = readQuestionCache(storage, LEGACY_STORAGE_KEYS);
    if (legacy) {
      const version = storage.getItem(LEGACY_STORAGE_KEYS.questionsVersion);
      try {
        // An interrupted copy must not leave a stale cache data
        storage.removeItem(QUESTIONS_CACHE_VERSION_KEY);
        storage.removeItem(QUESTIONS_SYNCED_AT_CACHE_KEY);
        storage.setItem(QUESTIONS_CACHE_KEY, JSON.stringify(legacy.questions));
        storage.setItem(QUESTIONS_SYNCED_AT_CACHE_KEY, legacy.syncedAt);
        if (version !== null) storage.setItem(QUESTIONS_CACHE_VERSION_KEY, version);
        clearQuestionCache(LEGACY_STORAGE_KEYS);
      } catch {
        // The validated legacy cache remains usable if migration fails
        clearQuestionCache();
      }
      return legacy;
    }
    clearQuestionCache();
    clearQuestionCache(LEGACY_STORAGE_KEYS);
  } catch {
    // Storage may be unavailable; retain existing data for now
  }
  return null;
}

function cacheQuestions(questions: Question[], syncedAt: string) {
  try {
    window.localStorage.setItem(QUESTIONS_CACHE_KEY, JSON.stringify(questions));
    window.localStorage.setItem(QUESTIONS_SYNCED_AT_CACHE_KEY, syncedAt);
    window.localStorage.setItem(QUESTIONS_CACHE_VERSION_KEY, QUESTIONS_CACHE_VERSION);
  } catch {
    return;
  }
}

function mergeQuestions(
  cachedQuestions: Question[],
  updatedQuestions: Question[],
) {
  const questionsByNumber = new Map(
    cachedQuestions.map((question) => [question.question_number, question]),
  );

  updatedQuestions.forEach((question) => {
    questionsByNumber.set(question.question_number, question);
  });

  return Array.from(questionsByNumber.values()).sort(
    (firstQuestion, secondQuestion) =>
      firstQuestion.question_number.localeCompare(
        secondQuestion.question_number,
        undefined,
        { numeric: true },
      ),
  );
}

export function useQuestionsData() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [rollCount, setRollCount] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    let shouldIgnore = false;

    async function loadDatabaseData() {
      const cachedQuestionData = getCachedQuestions();

      if (cachedQuestionData && !shouldIgnore) {
        setQuestions(cachedQuestionData.questions);
        setDataError("");
        setIsLoadingQuestions(false);
      }

      async function loadQuestions() {
        const useIncrementalSync = cachedQuestionData !== null && !cachedQuestionData.requiresFullRefresh;
        const questionsUrl = useIncrementalSync
          ? `/api/questions?updated_after=${encodeURIComponent(
              cachedQuestionData.syncedAt,
            )}`
          : "/api/questions";
        const response = await fetch(questionsUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch questions.");
        }

        const questionsData: unknown = await response.json();

        if (!isQuestionsResponse(questionsData)) {
          throw new Error("Invalid questions response.");
        }

        if (shouldIgnore) {
          return;
        }

        const nextQuestions = useIncrementalSync
          ? mergeQuestions(
              cachedQuestionData.questions,
              questionsData.questions,
            )
          : questionsData.questions;

        setQuestions(nextQuestions);
        cacheQuestions(nextQuestions, questionsData.synced_at);
        setDataError("");
      }

      async function loadCounter() {
        try {
          const response = await fetch("/api/counter");

          if (!response.ok) {
            return;
          }

          const counterData: unknown = await response.json();

          if (!shouldIgnore && isCounterResponse(counterData)) {
            setRollCount(counterData.spin_count);
          }
        } catch {
          return;
        }
      }

      const questionsRequest = loadQuestions()
        .catch(() => {
          if (shouldIgnore) {
            return;
          }

          if (!cachedQuestionData) {
            setDataError(
              "Unable to load questions. Refresh the page to try again.",
            );
          }
        })
        .finally(() => {
          if (!shouldIgnore && !cachedQuestionData) {
            setIsLoadingQuestions(false);
          }
        });

      await Promise.all([questionsRequest, loadCounter()]);
    }

    loadDatabaseData();

    return () => {
      shouldIgnore = true;
    };
  }, []);

  async function incrementRollCount() {
    try {
      const response = await fetch("/api/counter", { method: "POST" });

      if (!response.ok) {
        return;
      }

      const counterData: unknown = await response.json();

      if (isCounterResponse(counterData)) {
        setRollCount(counterData.spin_count);
      }
    } catch {
      return;
    }
  }

  return {
    dataError,
    incrementRollCount,
    isLoadingQuestions,
    questions,
    rollCount,
  };
}
