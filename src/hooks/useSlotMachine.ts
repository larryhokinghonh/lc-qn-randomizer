"use client";

import { useMemo, useEffect, useRef, useState } from "react";

import {
  buildInitialSpinItems,
  buildSpinItems,
  DEFAULT_SLOT_TEXT,
  type SpinItem,
} from "@/lib/question-utils";
import type { Question, RandomizationWarning } from "@/types/types";

export function useSlotMachine(
  questions: Question[],
  questionPool: Question[],
  eligibleQuestionPool: Question[],
  incrementRollCount: () => Promise<void>,
) {
  const currentSlotTextRef = useRef(DEFAULT_SLOT_TEXT);
  const revealCleanupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentSlotQuestion, setCurrentSlotQuestion] =
    useState<Question | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<Question | null>(null);
  const [revealedQuestion, setRevealedQuestion] = useState<Question | null>(null);
  const [spinItems, setSpinItems] = useState<SpinItem[]>([
    {
      text: DEFAULT_SLOT_TEXT,
      question: null,
    },
  ]);
  const [spinKey, setSpinKey] = useState(0);
  const [hasRandomized, setHasRandomized] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isSlotLanded, setIsSlotLanded] = useState(false);
  const [isQuestionVisible, setIsQuestionVisible] = useState(false);
  const [filterWarning, setFilterWarning] = useState(false);
  const [isProgressPromptOpen, setIsProgressPromptOpen] = useState(false);
  const warning: RandomizationWarning | null = !filterWarning
    ? null
    : questionPool.length === 0
      ? "no-matches"
      : eligibleQuestionPool.length === 0 ? "all-solved" : null;
  const initialSpinItems = useMemo(
    () => buildInitialSpinItems(questions),
    [questions],
  );
  const activeSpinItems = hasRandomized ? spinItems : initialSpinItems;
  const activeCurrentSlotQuestion =
    currentSlotQuestion ?? activeSpinItems[0]?.question ?? null;

  useEffect(() => {
    return () => {
      if (revealCleanupTimeoutRef.current) {
        clearTimeout(revealCleanupTimeoutRef.current);
      }
    };
  }, []);

  function clearRevealCleanupTimeout() {
    if (revealCleanupTimeoutRef.current) {
      clearTimeout(revealCleanupTimeoutRef.current);
      revealCleanupTimeoutRef.current = null;
    }
  }

  function scheduleRevealCleanup(revealFadeDuration: number) {
    clearRevealCleanupTimeout();
    revealCleanupTimeoutRef.current = setTimeout(() => {
      setRevealedQuestion(null);
      revealCleanupTimeoutRef.current = null;
    }, revealFadeDuration);
  }

  function handleRandomize(
    isLoadingQuestions: boolean,
    dataError: string,
    revealFadeDuration: number,
  ) {
    if (isLoadingQuestions || dataError || isSpinning) {
      return;
    }

    if (eligibleQuestionPool.length === 0) {
      setFilterWarning(true);
      return;
    }

    const nextQuestion =
      eligibleQuestionPool[Math.floor(Math.random() * eligibleQuestionPool.length)];
    const currentItem = {
      text:
        currentQuestion?.name ??
        (currentSlotTextRef.current === DEFAULT_SLOT_TEXT
          ? activeSpinItems[0]?.text
          : currentSlotTextRef.current) ??
        DEFAULT_SLOT_TEXT,
      question: activeCurrentSlotQuestion,
    };

    void incrementRollCount();
    setFilterWarning(false);
    setIsProgressPromptOpen(false);
    setHasRandomized(true);
    setIsSpinning(true);
    setIsSlotLanded(false);
    setPendingQuestion(nextQuestion);

    if (revealedQuestion) {
      setIsQuestionVisible(false);
      scheduleRevealCleanup(revealFadeDuration);
    } else {
      clearRevealCleanupTimeout();
      setIsQuestionVisible(false);
    }

    setSpinItems(buildSpinItems(currentItem, nextQuestion, questionPool));
    setSpinKey((currentKey) => currentKey + 1);
  }

  function clearFilterWarning() {
    setFilterWarning(false);
  }

  function handleQuestionLinkOpen(number: string) {
    if (
      window.matchMedia("(min-width: 640px)").matches &&
      !isSpinning && isSlotLanded && isQuestionVisible &&
      revealedQuestion?.question_number === number
    ) {
      setIsProgressPromptOpen(true);
    }
  }

  function handleSlotTextChange(index: number) {
    const spinItem = activeSpinItems[index];

    currentSlotTextRef.current = spinItem?.text ?? currentSlotTextRef.current;
    setCurrentSlotQuestion(spinItem?.question ?? null);
  }

  function handleSpinTextAnimationComplete(index: number) {
    if (!isSpinning || !pendingQuestion || index !== activeSpinItems.length - 1) {
      return;
    }

    clearRevealCleanupTimeout();
    setCurrentQuestion(pendingQuestion);
    setRevealedQuestion(pendingQuestion);
    setIsQuestionVisible(true);
    setPendingQuestion(null);
    setIsSpinning(false);
    setIsSlotLanded(true);
  }

  return {
    clearFilterWarning,
    currentSlotQuestion: activeCurrentSlotQuestion,
    filterWarning: warning,
    handleQuestionLinkOpen,
    handleRandomize,
    handleSlotTextChange,
    handleSpinTextAnimationComplete,
    hasRandomized,
    isQuestionVisible,
    isProgressPromptOpen,
    isSlotLanded,
    isSpinning,
    revealedQuestion,
    spinItems: activeSpinItems,
    spinKey,
  };
}
