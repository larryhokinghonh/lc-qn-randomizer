"use client";

import { useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import type { RefObject } from "react";

import { prepareSidebarQuestions } from "@/lib/sidebar-questions";
import type { Question } from "@/types/types";

type QuestionPoolPickerProps = {
  questions: Question[];
  selectedQuestions: Question[];
  isLoading: boolean;
  dataError: string;
  storageError: string;
  onAdd: (number: string) => void;
  onRemove: (number: string) => void;
};

type QuestionPoolPanelProps = QuestionPoolPickerProps & {
  id: string;
  searchRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
};

const ACTION_CLASS = "flex min-h-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-300 px-2 text-xs font-semibold transition-colors hover:border-[#ffa116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116] disabled:cursor-default disabled:opacity-50 dark:border-zinc-600";

function QuestionPoolPanel({
  questions, selectedQuestions, isLoading, dataError, storageError, onAdd, onRemove,
  id, searchRef, onClose,
}: QuestionPoolPanelProps) {
  const [search, setSearch] = useState("");
  const query = useDeferredValue(search.trim().toLowerCase());
  const prepared = useMemo(() => prepareSidebarQuestions(questions), [questions]);
  const matches = useMemo(() => query ? prepared.filter(({ question, searchTitle }) =>
    question.question_number.includes(query) || searchTitle.includes(query),
  ) : [], [prepared, query]);
  const searchMessage = isLoading ? "Loading questions…" : dataError || (query && matches.length === 0 ? "No matching questions." : "");
  const selectedNumbers = new Set(selectedQuestions.map((question) => question.question_number));
  const isPresent = useIsPresent();
  const reducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-60 overflow-hidden">
      <motion.section
        animate={{ x: 0, opacity: 1 }}
        aria-labelledby={`${id}-title`}
        aria-modal={false}
        className="pointer-events-auto absolute inset-y-6 right-6 flex w-[min(24rem,calc(50vw-2rem))] flex-col overflow-hidden rounded-2xl border border-zinc-300 bg-white text-zinc-950 shadow-2xl/40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        exit={{ x: "calc(100% + 1.5rem)", opacity: 0 }}
        id={`${id}-panel`}
        inert={!isPresent}
        initial={{ x: "calc(100% + 1.5rem)", opacity: 0 }}
        role="dialog"
        transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeInOut" }}
      >
        <div className="shrink-0 space-y-4 border-b border-zinc-200 p-4 dark:border-zinc-700">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold" id={`${id}-title`}>Custom question pool</h2>
          </div>
          <label className="sr-only" htmlFor={`${id}-search`}>Search by question number or title</label>
          <input
            className="h-11 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none placeholder:text-zinc-500 focus:border-[#ffa116] dark:border-zinc-600 dark:bg-zinc-900 dark:placeholder:text-zinc-400"
            id={`${id}-search`}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by question number or title"
            ref={searchRef}
            type="search"
            value={search}
          />
          <p className="text-xs text-zinc-600 dark:border-zinc-600 dark:text-zinc-300" role="status">
            Filters are paused while your list is active.
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4">
          {storageError && <p className="text-sm text-amber-800 dark:text-amber-200" role="alert">{storageError}</p>}

          <div aria-busy={search.trim().toLowerCase() !== query}>
            <h3 className="mb-2 text-sm font-semibold">Search results</h3>
            <p className="sr-only" role="status">{query ? `${matches.length} matching questions.` : ""}</p>
            {searchMessage ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400" role={dataError ? "alert" : undefined}>
                {searchMessage}
              </p>
            ) : query && (
              <ul aria-label="Matching questions" className="max-h-60 divide-y divide-zinc-200 overflow-y-auto overscroll-contain dark:divide-zinc-700">
                {matches.map(({ question }) => {
                  const isAdded = selectedNumbers.has(question.question_number);
                  return (
                    <li className="flex items-center gap-3 py-3 [content-visibility:auto] [contain-intrinsic-size:auto_4rem]" key={question.question_number}>
                      <span className="min-w-0 flex-1 wrap-break-word text-sm">{question.question_number}. {question.name}</span>
                      <button
                        aria-label={`${isAdded ? "Added" : "Add"} ${question.question_number}. ${question.name}`}
                        className={ACTION_CLASS}
                        disabled={isAdded}
                        onClick={() => {
                          onAdd(question.question_number);
                          searchRef.current?.focus({ preventScroll: true });
                        }}
                        type="button"
                      >
                        {isAdded ? "Added" : "Add"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Selected questions ({selectedQuestions.length})</h3>
            {selectedQuestions.length > 0 && (
              <ul aria-label="Selected questions" className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {selectedQuestions.map((question) => (
                  <li className="flex items-center gap-3 py-3 [content-visibility:auto] [contain-intrinsic-size:auto_4rem]" key={question.question_number}>
                    <span className="min-w-0 flex-1 wrap-break-word text-sm">{question.question_number}. {question.name}</span>
                    <button
                      aria-label={`Remove ${question.question_number}. ${question.name}`}
                      className={ACTION_CLASS}
                      onClick={(event) => {
                        const row = event.currentTarget.closest("li");
                        const next = row?.nextElementSibling?.querySelector("button") ?? row?.previousElementSibling?.querySelector("button");
                        (next ?? searchRef.current)?.focus({ preventScroll: true });
                        onRemove(question.question_number);
                      }}
                      type="button"
                    >X</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default function QuestionPoolPicker(props: QuestionPoolPickerProps) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closePanel = useCallback(() => {
    setIsOpen(false);
    toggleRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    searchRef.current?.focus({ preventScroll: true });
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !event.defaultPrevented && !document.querySelector("dialog[open]")) {
        event.preventDefault();
        closePanel();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closePanel]);

  return (
    <>
      <button
        aria-controls={isOpen ? `${id}-panel` : undefined}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="h-12 shrink-0 cursor-pointer whitespace-nowrap rounded-xl border border-zinc-300 bg-black px-4 text-sm font-semibold text-zinc-200 shadow-2xl/35 transition-colors hover:border-[#ffa116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116] dark:border-zinc-700"
        onClick={() => isOpen ? closePanel() : setIsOpen(true)}
        ref={toggleRef}
        type="button"
      >Pick questions</button>
      {createPortal(
        <AnimatePresence>
          {isOpen && <QuestionPoolPanel {...props} id={id} onClose={closePanel} searchRef={searchRef} />}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
