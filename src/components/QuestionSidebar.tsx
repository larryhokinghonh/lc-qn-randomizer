"use client";

import { useDeferredValue, useId, useMemo } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";

import QuestionSidebarHeader from "@/components/QuestionSidebarHeader";
import QuestionSidebarList from "@/components/QuestionSidebarList";
import { useQuestionSidebar } from "@/hooks/useQuestionSidebar";
import { useSidebarWidth } from "@/hooks/useSidebarWidth";
import { prepareSidebarQuestions } from "@/lib/sidebar-questions";
import type { Question } from "@/types/types";

type QuestionSidebarProps = {
  dataError: string;
  isLoadingQuestions: boolean;
  questions: Question[];
};

const PANEL_VARIANTS = {
  open: { x: 0 },
  closed: { x: "-100%" },
} satisfies Variants;

const BACKDROP_VARIANTS = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
} satisfies Variants;

export default function QuestionSidebar({
  dataError,
  isLoadingQuestions,
  questions,
}: QuestionSidebarProps) {
  const id = useId();
  const {
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
  } = useQuestionSidebar();
  const {
    endResize,
    moveResize,
    shouldIgnoreBackdropClick,
    startResize,
    width,
  } = useSidebarWidth({ canResize: phase === "open", isOpen });
  const preparedQuestions = useMemo(() => prepareSidebarQuestions(questions), [questions]);
  const deferredQuery = useDeferredValue(questionSearch.trim().toLowerCase());
  const animationState = phase === "open" ? "open" : "closed";
  const toggleClassName = "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-950 transition-colors hover:border-[#ffa116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116] motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

  return (
    <>
      <button
        aria-controls={`${id}-drawer`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Open question list"
        className={`fixed left-9 top-9 z-60 hidden sm:flex ${toggleClassName}`}
        onClick={openSidebar}
        ref={toggleRef}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="20"
          viewBox="0 0 24 24"
          width="20"
        >
          <path
            d="M4 5h16v14H4zM9 5v14"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </button>

      <dialog
        aria-labelledby={`${id}-title`}
        className="m-0 hidden h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-transparent min-[640px]:open:flex"
        id={`${id}-drawer`}
        onCancel={(event) => {
          event.preventDefault();
          closeSidebar();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget && !shouldIgnoreBackdropClick()) {
            closeSidebar();
          }
        }}
        onKeyDown={handleDialogKeyDown}
        ref={dialogRef}
      >
        <motion.div
          animate={animationState}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black/55"
          initial={false}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeInOut" }}
          variants={BACKDROP_VARIANTS}
        />
        <motion.div
          animate={animationState}
          className="question-drawer-panel relative flex h-full max-w-full shrink-0 flex-col border-r border-zinc-300 bg-white text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          initial={false}
          onAnimationComplete={(definition) => {
            if (definition === "closed" && phase === "closing") {
              finishClosing();
            }
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeInOut" }}
          style={{ width }}
          variants={PANEL_VARIANTS}
        >
          <QuestionSidebarHeader
            id={id}
            onClose={closeSidebar}
            onSearch={changeQuestionSearch}
            questions={questions}
            search={questionSearch}
            searchRef={searchRef}
            toggleClassName={toggleClassName}
          />
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none]"
            onScroll={rememberScrollPosition}
            ref={listRef}
          >
            <QuestionSidebarList
              dataError={dataError}
              expandedQuestionNumber={expandedQuestionNumber}
              id={id}
              isLoadingQuestions={isLoadingQuestions}
              isOpen={isOpen}
              navigationRef={listNavigationRef}
              onResetScroll={resetScrollPosition}
              onToggle={toggleQuestion}
              prepared={preparedQuestions}
              query={deferredQuery}
              scrollRef={listRef}
            />
          </div>
          <div
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            className="absolute inset-y-0 right-0 z-10 w-2 cursor-col-resize touch-none select-none hover:bg-[#ffa116]/20 data-[resizing=true]:bg-[#ffa116]/30"
            onClick={(event) => event.stopPropagation()}
            onLostPointerCapture={endResize}
            onPointerCancel={endResize}
            onPointerDown={startResize}
            onPointerMove={moveResize}
            onPointerUp={endResize}
            role="separator"
            title="Drag to resize sidebar"
          >
            <span className="absolute inset-y-0 right-0 w-px bg-zinc-400/60 dark:bg-zinc-600" />
          </div>
        </motion.div>
      </dialog>
    </>
  );
}
