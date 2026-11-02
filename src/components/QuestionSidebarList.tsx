"use client";

import { memo } from "react";
import type { RefObject } from "react";

import QuestionSidebarRow from "@/components/QuestionSidebarRow";
import { useQuestionList } from "@/hooks/useQuestionList";
import type { prepareSidebarQuestions } from "@/lib/sidebar-questions";
import type { QuestionListNavigation } from "@/types/types";

type QuestionSidebarListProps = {
  id: string;
  prepared: ReturnType<typeof prepareSidebarQuestions>;
  query: string;
  expandedQuestionNumber: string | null;
  onToggle: (number: string) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  navigationRef: RefObject<QuestionListNavigation | null>;
  isOpen: boolean;
  onResetScroll: () => void;
  dataError: string;
  isLoadingQuestions: boolean;
};

export default memo(function QuestionSidebarList({
  id, prepared, query, expandedQuestionNumber, onToggle, scrollRef, navigationRef,
  isOpen, onResetScroll, dataError, isLoadingQuestions,
}: QuestionSidebarListProps) {
  const { items, totalSize, measureElement, questions, elementRef, handleBlur, handleFocus, handleKeyDown } = useQuestionList({
    prepared, query, scrollRef, navigationRef, isOpen, onResetScroll,
  });
  if (questions.length === 0) {
    return (
      <p className="px-6 py-5 text-sm text-zinc-600 dark:text-zinc-300" role={prepared.length === 0 && dataError ? "alert" : "status"}>
        {prepared.length > 0 ? "No matching questions." : isLoadingQuestions ? "Loading questions…" : dataError || "No questions available."}
      </p>
    );
  }
  return (
    <ul
      className="relative w-full"
      onBlurCapture={handleBlur}
      onFocusCapture={handleFocus}
      onKeyDown={handleKeyDown}
      ref={elementRef}
      style={{ height: totalSize }}
    >
      {items.map((item) => {
        const question = questions[item.index];
        return (
          <li
            aria-posinset={item.index + 1}
            aria-setsize={questions.length}
            className="absolute top-0 left-0 w-full border-b border-zinc-200 dark:border-zinc-700"
            data-index={item.index}
            data-question-number={question.question_number}
            key={item.key}
            ref={measureElement}
            style={{ transform: `translateY(${item.start}px)` }}
          >
            <QuestionSidebarRow id={id} isExpanded={expandedQuestionNumber === question.question_number} onToggle={onToggle} question={question} />
          </li>
        );
      })}
    </ul>
  );
});
