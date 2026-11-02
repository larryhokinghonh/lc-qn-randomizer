"use client";

import { useId } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";

import QuestionNotes from "@/components/QuestionNotes";
import { useQuestionNotes } from "@/hooks/useQuestionNotes";
import { useQuestionSidebar } from "@/hooks/useQuestionSidebar";
import { useSidebarWidth } from "@/hooks/useSidebarWidth";
import { getDifficultyColorClass } from "@/lib/question-utils";
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
    listRef,
    openSidebar,
    phase,
    prefersReducedMotion,
    questionSearch,
    rememberScrollPosition,
    searchRef,
    toggleQuestion,
    toggleRef,
  } = useQuestionSidebar();
  const { exportNotes, hasNotes, notes, notesError, saveNote } = useQuestionNotes();
  const {
    endResize,
    moveResize,
    shouldIgnoreBackdropClick,
    startResize,
    width,
  } = useSidebarWidth(phase === "open");
  const sortedQuestions = [...questions].sort((first, second) =>
    first.question_number.localeCompare(second.question_number, undefined, {
      numeric: true,
    }),
  );
  const searchQuery = questionSearch.trim().toLowerCase();
  const matchingQuestions = searchQuery
    ? sortedQuestions.filter(
        (question) =>
          question.question_number.includes(searchQuery) ||
          question.name.toLowerCase().includes(searchQuery),
      )
    : sortedQuestions;
  const animationState = phase === "open" ? "open" : "closed";
  const toggleClassName =
    "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-950 transition-colors hover:border-[#ffa116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116] motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

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
          <div className="flex h-18 shrink-0 items-center gap-4 border-b border-zinc-300 px-4 dark:border-zinc-700">
            <button
              aria-label="Close question list"
              className={toggleClassName}
              onClick={closeSidebar}
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
                  d="m14 6-6 6 6 6M20 4v16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
            <h2 className="flex-1 text-lg font-semibold" id={`${id}-title`}>
              Questions
            </h2>
            <button
              aria-label="Export notes"
              className="h-10 shrink-0 cursor-pointer rounded-lg border border-zinc-300 px-3 text-sm font-semibold hover:border-[#ffa116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116] disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
              disabled={!hasNotes}
              onClick={() => exportNotes(questions)}
              type="button"
            >
              Export
            </button>
          </div>

          <div className="shrink-0 border-b border-zinc-300 px-4 py-3 dark:border-zinc-700">
            <input
              aria-label="Search questions"
              className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-500 focus:border-[#ffa116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-400"
              onChange={(event) => changeQuestionSearch(event.target.value)}
              placeholder="Search by question number or title"
              ref={searchRef}
              type="search"
              value={questionSearch}
            />
          </div>

          {notesError ? (
            <p className="shrink-0 border-b border-amber-500 px-4 py-3 text-xs leading-5 text-amber-800 dark:text-amber-200" role="alert">
              {notesError}
            </p>
          ) : null}

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            onScroll={rememberScrollPosition}
            ref={listRef}
          >
            {matchingQuestions.length > 0 ? (
              <ul>
                {matchingQuestions.map((question) => {
                  const isExpanded =
                    expandedQuestionNumber === question.question_number;
                  const detailsId = `${id}-question-${encodeURIComponent(question.question_number)}`;

                  return (
                    <li
                      className="border-b border-zinc-200 [content-visibility:auto] [contain-intrinsic-size:auto_64px] dark:border-zinc-700"
                      key={question.question_number}
                    >
                      <button
                        aria-controls={detailsId}
                        aria-expanded={isExpanded}
                        className="flex min-h-16 w-full cursor-pointer items-start gap-3 px-6 py-4 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#ffa116] motion-reduce:transition-none"
                        onClick={() => toggleQuestion(question.question_number)}
                        type="button"
                      >
                        <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
                          {question.question_number}.
                        </span>
                        <span className="min-w-0 flex-1 wrap-break-word font-semibold">
                          {question.name}
                          {question.needs_premium ? (
                            <span className="mt-1 block text-xs font-medium text-[#9a5800] dark:text-[#ffa116]">
                              Premium
                            </span>
                          ) : null}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`mt-1 shrink-0 transition-transform motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`}
                        >
                          <svg fill="none" height="14" viewBox="0 0 24 24" width="14">
                            <path
                              d="m6 9 6 6 6-6"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </span>
                      </button>

                      <div
                        className="space-y-4 px-6 pt-2 pb-6 text-xs leading-5"
                        hidden={!isExpanded}
                        id={detailsId}
                      >
                        {isExpanded ? (
                          <>
                            <p className={`inline-flex rounded bg-zinc-950 px-2 py-0.5 font-semibold ${getDifficultyColorClass(question.difficulty)}`}>
                              {question.difficulty}
                            </p>
                            <dl className="space-y-3">
                              <div>
                                <dt className="text-zinc-500 dark:text-zinc-400">
                                  Topics
                                </dt>
                                <dd className="wrap-break-word">
                                  {question.topics.length > 0
                                    ? question.topics.join(" / ")
                                    : "No topics assigned."}
                                </dd>
                              </div>
                              {question.special_topics.length > 0 ? (
                                <div>
                                  <dt className="text-zinc-500 dark:text-zinc-400">
                                    Lists
                                  </dt>
                                  <dd className="wrap-break-word">
                                    {question.special_topics.join(" / ")}
                                  </dd>
                                </div>
                              ) : null}
                              <div>
                                <dt className="text-zinc-500 dark:text-zinc-400">
                                  Access
                                </dt>
                                <dd>
                                  {question.needs_premium
                                    ? "LeetCode Premium required"
                                    : "Free"}
                                </dd>
                              </div>
                            </dl>
                            <a
                              className="inline-flex min-h-9 items-center rounded border border-zinc-300 px-3 font-semibold hover:border-[#ffa116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116] dark:border-zinc-600"
                              href={question.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Open on LeetCode
                              <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                            <QuestionNotes
                              onChange={(value) => saveNote(question, value)}
                              questionNumber={question.question_number}
                              value={notes.get(question.question_number)?.text ?? ""}
                            />
                          </>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p
                className="px-6 py-5 text-sm text-zinc-600 dark:text-zinc-300"
                role={questions.length === 0 && dataError ? "alert" : "status"}
              >
                {questions.length > 0
                  ? "No matching questions."
                  : isLoadingQuestions
                    ? "Loading questions…"
                    : dataError || "No questions available."}
              </p>
            )}
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
