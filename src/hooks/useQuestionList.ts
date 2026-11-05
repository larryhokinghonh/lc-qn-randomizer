"use client";

import { useCallback, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, RefObject } from "react";

import { useVirtualQuestionList } from "@/hooks/useVirtualQuestionList";
import type { prepareSidebarQuestions } from "@/lib/sidebar-questions";
import type { QuestionListNavigation } from "@/types/types";

type FocusEdge = "first" | "last";
type PendingFocus = { query: string } & (
  | { kind: "question"; number: string; edge: FocusEdge }
  | { kind: "first" }
);
type QuestionListOptions = {
  prepared: ReturnType<typeof prepareSidebarQuestions>;
  query: string;
  scrollRef: RefObject<HTMLDivElement | null>;
  navigationRef: RefObject<QuestionListNavigation | null>;
  isOpen: boolean;
  onResetScroll: () => void;
};

export function useQuestionList({ prepared, query, scrollRef, navigationRef, isOpen, onResetScroll }: QuestionListOptions) {
  const elementRef = useRef<HTMLUListElement>(null);
  const previousQueryRef = useRef(query);
  const handledFocusRef = useRef<PendingFocus | null>(null);
  const [focusedNumber, setFocusedNumber] = useState<string | null>(null);
  const [pendingFocus, setPendingFocus] = useState<PendingFocus | null>(null);
  const questions = useMemo(() => prepared
    .filter(({ question, searchTitle }) => !query || question.question_number.includes(query) || searchTitle.includes(query))
    .map(({ question }) => question), [prepared, query]);
  const indexes = useMemo(() => new Map(questions.map((question, index) => [question.question_number, index])), [questions]);
  const virtual = useVirtualQuestionList({
    questions,
    scrollRef,
    focusedIndex: focusedNumber === null ? undefined : indexes.get(focusedNumber),
    pendingIndex: pendingFocus === null || pendingFocus.query !== query
      ? undefined
      : pendingFocus.kind === "first" ? (questions.length > 0 ? 0 : undefined) : indexes.get(pendingFocus.number),
    isOpen,
  });
  const { scrollToIndex, scrollToOffset } = virtual;

  const requestFocus = useCallback((index: number, edge: FocusEdge) => {
    const question = questions[index];
    if (!question) return false;
    setPendingFocus({ kind: "question", number: question.question_number, edge, query });
    scrollToIndex(index, { align: "auto" });
    return true;
  }, [questions, query, scrollToIndex]);

  useImperativeHandle(navigationRef, () => ({
    focusFirst: (requestedQuery) => {
      if (requestedQuery === query) return requestFocus(0, "first");

      setPendingFocus({ kind: "first", query: requestedQuery });
      return true;
    },
    focusLast: () => requestFocus(questions.length - 1, "last"),
    cancelPendingFocus: () => setPendingFocus(null),
  }), [questions.length, query, requestFocus]);

  useLayoutEffect(() => {
    if (previousQueryRef.current !== query) {
      previousQueryRef.current = query;
      scrollToOffset(0);
      onResetScroll();
    }
  }, [query, scrollToOffset, onResetScroll]);

  useLayoutEffect(() => {
    if (!pendingFocus || pendingFocus.query !== query || handledFocusRef.current === pendingFocus) return;
    const number = pendingFocus.kind === "first" ? questions[0]?.question_number : pendingFocus.number;
    if (number === undefined) {
      handledFocusRef.current = pendingFocus;
      scrollRef.current?.closest("dialog")?.querySelector<HTMLElement>('button[aria-label="Close question list"]')?.focus();
      return;
    }
    const row = Array.from(elementRef.current?.children ?? []).find(
      (element) => element instanceof HTMLElement && element.dataset.questionNumber === number,
    );
    const controls = row?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], textarea:not(:disabled), select:not(:disabled)");
    const target = pendingFocus.kind === "first" || pendingFocus.edge === "first" ? controls?.item(0) : controls?.item(controls.length - 1);
    if (target) {
      handledFocusRef.current = pendingFocus;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "nearest" });
    }
  }, [pendingFocus, query, questions, scrollRef, virtual.items]);

  function handleFocus(event: FocusEvent<HTMLUListElement>) {
    const row = event.target.closest<HTMLElement>("[data-question-number]");
    if (!row) return;
    setFocusedNumber(row.dataset.questionNumber ?? null);
    setPendingFocus(null);
  }

  function handleBlur(event: FocusEvent<HTMLUListElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocusedNumber(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key !== "Tab" || !(event.target instanceof HTMLElement)) return;
    const row = event.target.closest<HTMLElement>("[data-question-number]");
    const index = row?.dataset.questionNumber ? indexes.get(row.dataset.questionNumber) : undefined;
    if (!row || index === undefined) return;
    const controls = Array.from(row.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], textarea:not(:disabled), select:not(:disabled)"));
    const controlIndex = controls.indexOf(event.target);
    if (controlIndex < 0) return;
    event.preventDefault();
    const nextControl = controls[controlIndex + (event.shiftKey ? -1 : 1)];
    if (nextControl) {
      nextControl.focus();
    } else if (!requestFocus(index + (event.shiftKey ? -1 : 1), event.shiftKey ? "last" : "first")) {
      const dialog = row.closest("dialog");
      const selector = event.shiftKey ? 'input[type="search"]' : 'button[aria-label="Close question list"]';
      dialog?.querySelector<HTMLElement>(selector)?.focus();
    }
  }

  return { ...virtual, questions, elementRef, handleBlur, handleFocus, handleKeyDown };
}
