"use client";

import { useEffect, useState } from "react";

import type {
  CounterResponse,
  Question,
  QuestionsResponse,
} from "@/types/types";

const QUESTIONS_CACHE_KEY = "lc-question-randomizer.questions";
const QUESTIONS_SYNCED_AT_CACHE_KEY = "lc-question-randomizer.synced-at";
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

function clearQuestionCache() {
  try {
    window.localStorage.removeItem(QUESTIONS_CACHE_KEY);
    window.localStorage.removeItem(QUESTIONS_SYNCED_AT_CACHE_KEY);
  } catch {
    return;
  }
}

function getCachedQuestions() {
  try {
    const cachedQuestions = window.localStorage.getItem(QUESTIONS_CACHE_KEY);
    const cachedSyncedAt = window.localStorage.getItem(
      QUESTIONS_SYNCED_AT_CACHE_KEY,
    );

    if (!cachedQuestions && !cachedSyncedAt) {
      return null;
    }

    if (!cachedQuestions || !cachedSyncedAt) {
      clearQuestionCache();
      return null;
    }

    const questions: unknown = JSON.parse(cachedQuestions);

    if (
      !Array.isArray(questions) ||
      !questions.every(isQuestion) ||
      !isValidTimestamp(cachedSyncedAt)
    ) {
      clearQuestionCache();
      return null;
    }

    return {
      questions,
      syncedAt: cachedSyncedAt,
    };
  } catch {
    clearQuestionCache();
    return null;
  }
}

function cacheQuestions(questions: Question[], syncedAt: string) {
  try {
    window.localStorage.setItem(QUESTIONS_CACHE_KEY, JSON.stringify(questions));
    window.localStorage.setItem(QUESTIONS_SYNCED_AT_CACHE_KEY, syncedAt);
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
        const questionsUrl = cachedQuestionData
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

        const nextQuestions = cachedQuestionData
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
