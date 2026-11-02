"use client";

import type { RefObject } from "react";

import { useQuestionNotesStatus } from "@/hooks/useQuestionNotes";
import { exportQuestionNotes } from "@/lib/question-notes-store";
import type { Question } from "@/types/types";

type QuestionSidebarControlsProps = {
  id: string;
  onClose: () => void;
  onSearch: (value: string) => void;
  questions: Question[];
  search: string;
  searchRef: RefObject<HTMLInputElement | null>;
  toggleClassName: string;
};

export default function QuestionSidebarControls({
  id, onClose, onSearch, questions, search, searchRef, toggleClassName,
}: QuestionSidebarControlsProps) {
  const { hasNotes, notesError } = useQuestionNotesStatus();
  return (
    <>
      <div className="flex h-18 shrink-0 items-center gap-4 border-b border-zinc-300 px-4 dark:border-zinc-700">
        <button aria-label="Close question list" className={toggleClassName} onClick={onClose} type="button">
          <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
            <path d="m14 6-6 6 6 6M20 4v16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </button>
        <h2 className="flex-1 text-lg font-semibold" id={`${id}-title`}>Questions</h2>
        <button
          aria-label="Export notes"
          className="h-10 shrink-0 cursor-pointer rounded-lg border border-zinc-300 px-3 text-sm font-semibold hover:border-[#ffa116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116] disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
          disabled={!hasNotes}
          onClick={() => exportQuestionNotes(questions)}
          type="button"
        >Export</button>
      </div>
      <div className="shrink-0 border-b border-zinc-300 px-4 py-3 dark:border-zinc-700">
        <input
          aria-label="Search questions"
          className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-500 focus:border-[#ffa116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-400"
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search by question number or title"
          ref={searchRef}
          type="search"
          value={search}
        />
      </div>
      {notesError ? (
        <p className="shrink-0 border-b border-amber-500 px-4 py-3 text-xs leading-5 text-amber-800 dark:text-amber-200" role="alert">{notesError}</p>
      ) : null}
    </>
  );
}
