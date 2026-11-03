"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import type { KeyboardEvent, UIEvent } from "react";
import { useReducedMotion } from "motion/react";

import { flushQuestionNotes } from "@/lib/question-notes-store";
import type { QuestionListNavigation } from "@/types/types";

const DESKTOP_QUERY = "(min-width: 640px)";
type SidebarPhase = "closed" | "open" | "closing";

export function useQuestionSidebar() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listNavigationRef = useRef<QuestionListNavigation | null>(null);
  const scrollPositionRef = useRef(0);
  const [phase, setPhase] = useState<SidebarPhase>("closed");
  const [questionSearch, setQuestionSearch] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const isOpen = phase !== "closed";
  const [expandedQuestionNumber, setExpandedQuestionNumber] = useState<
    string | null
  >(null);

  const finishClosing = useCallback(() => {
    flushQuestionNotes();
    const isDesktop = window.matchMedia(DESKTOP_QUERY).matches;

    if (isDesktop) {
      scrollPositionRef.current = listRef.current?.scrollTop ?? 0;
    }

    dialogRef.current?.close();
    setPhase("closed");

    if (isDesktop) {
      toggleRef.current?.focus({ preventScroll: true });
    }
  }, []);

  function closeSidebar() {
    if (!dialogRef.current?.open) {
      return;
    }

    flushQuestionNotes();

    if (
      !window.matchMedia(DESKTOP_QUERY).matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      finishClosing();
    } else {
      setPhase("closing");
    }
  }

  function openSidebar() {
    if (!window.matchMedia(DESKTOP_QUERY).matches) {
      return;
    }

    dialogRef.current?.showModal();
    searchRef.current?.focus({ preventScroll: true });

    if (listRef.current) {
      listRef.current.scrollTop = scrollPositionRef.current;
    }

    setPhase("open");
  }

  function changeQuestionSearch(value: string) {
    listNavigationRef.current?.cancelPendingFocus();
    setQuestionSearch(value);
  }

  const resetScrollPosition = useCallback(() => {
    scrollPositionRef.current = 0;

    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, []);

  const toggleQuestion = useCallback((questionNumber: string) => {
    setExpandedQuestionNumber((currentNumber) =>
      currentNumber === questionNumber ? null : questionNumber,
    );
  }, []);

  function rememberScrollPosition(event: UIEvent<HTMLDivElement>) {
    if (dialogRef.current?.open && window.matchMedia(DESKTOP_QUERY).matches) {
      scrollPositionRef.current = event.currentTarget.scrollTop;
    }
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.defaultPrevented) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeSidebar();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const controls = event.currentTarget.querySelectorAll<
      HTMLButtonElement | HTMLAnchorElement | HTMLInputElement | HTMLTextAreaElement
    >("button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled)");
    const first = controls.item(0);
    const last = controls.item(controls.length - 1);
    const search = searchRef.current;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      if (!listNavigationRef.current?.focusLast()) last?.focus();
    } else if (!event.shiftKey && search && document.activeElement === search) {
      event.preventDefault();
      if (!listNavigationRef.current?.focusFirst(search.value.trim().toLowerCase())) first?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  const handleMotionPreferenceChange = useEffectEvent(
    (event: MediaQueryListEvent) => {
      if (event.matches && phase === "closing") {
        finishClosing();
      }
    },
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    function handleBreakpointChange() {
      if (!desktop.matches) {
        finishClosing();
      }
    }

    desktop.addEventListener("change", handleBreakpointChange);
    reducedMotion.addEventListener("change", handleMotionPreferenceChange);
    handleBreakpointChange();

    return () => {
      desktop.removeEventListener("change", handleBreakpointChange);
      reducedMotion.removeEventListener("change", handleMotionPreferenceChange);
      root.style.overflow = previousOverflow;
    };
  }, [finishClosing, isOpen]);

  return {
    changeQuestionSearch,
    closeSidebar,
    dialogRef,
    expandedQuestionNumber,
    finishClosing,
    handleDialogKeyDown,
    isOpen,
    listNavigationRef,
    listRef,
    openSidebar,
    phase,
    prefersReducedMotion,
    questionSearch,
    rememberScrollPosition,
    resetScrollPosition,
    searchRef,
    toggleQuestion,
    toggleRef,
  };
}
