"use client";

import { useCallback } from "react";
import type { RefObject } from "react";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import type { Range } from "@tanstack/react-virtual";

import type { Question } from "@/types/types";

type VirtualQuestionListOptions = {
  questions: Question[];
  scrollRef: RefObject<HTMLDivElement | null>;
  focusedIndex: number | undefined;
  pendingIndex: number | undefined;
  isOpen: boolean;
};

export function useVirtualQuestionList({
  questions, scrollRef, focusedIndex, pendingIndex, isOpen,
}: VirtualQuestionListOptions) {
  "use no memo";

  const getItemKey = useCallback((index: number) => questions[index]?.question_number ?? index, [questions]);
  const rangeExtractor = useCallback((range: Range) => {
    const indexes = new Set(defaultRangeExtractor(range));
    if (focusedIndex !== undefined) indexes.add(focusedIndex);
    if (pendingIndex !== undefined) indexes.add(pendingIndex);
    return [...indexes].sort((first, second) => first - second);
  }, [focusedIndex, pendingIndex]);

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLLIElement>({
    count: questions.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 80,
    getItemKey,
    overscan: 5,
    rangeExtractor,
    useCachedMeasurements: !isOpen,
    useAnimationFrameWithResizeObserver: true,
  });
  return {
    items: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    measureElement: virtualizer.measureElement,
    scrollToIndex: virtualizer.scrollToIndex,
    scrollToOffset: virtualizer.scrollToOffset,
  };
}
