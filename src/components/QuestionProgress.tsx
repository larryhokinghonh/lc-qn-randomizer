"use client";

import { useQuestionProgress } from "@/hooks/useQuestionProgress";
import {
  isQuestionProgress,
  QUESTION_PROGRESS_LABELS,
} from "@/lib/question-progress";
import { updateQuestionProgress } from "@/lib/question-progress-store";
import type { Question } from "@/types/types";

export function QuestionProgressSelect({ question }: { question: Question }) {
  const progress = useQuestionProgress(question.question_number);
  return (
    <select
      aria-label={`Progress for question ${question.question_number}: ${question.name}`}
      className="h-8 w-26 shrink-0 cursor-pointer rounded border border-zinc-600 bg-zinc-950 px-2 text-xs font-semibold text-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116]"
      onChange={(event) => {
        if (isQuestionProgress(event.target.value)) updateQuestionProgress(question.question_number, event.target.value);
      }}
      style={{ colorScheme: "dark" }}
      value={progress}
    >
      <option value="new">New</option>
      <option value="attempted">Attempted</option>
      <option value="solved">Solved</option>
    </select>
  );
}

export function QuestionProgressBadge({ number }: { number: string }) {
  const progress = useQuestionProgress(number);
  return (
    <span
      aria-label={`Progress: ${QUESTION_PROGRESS_LABELS[progress]}`}
      className="hidden border border-zinc-600 bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-zinc-300 sm:inline-flex"
    >
      {QUESTION_PROGRESS_LABELS[progress]}
    </span>
  );
}

export function QuestionProgressPrompt({ question }: { question: Question }) {
  const number = question.question_number;
  const progress = useQuestionProgress(number);
  const linkClassName = "text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116]";
  return (
    <section aria-label="Question progress" className="hidden space-y-3 border-2 border-zinc-300 p-3 dark:border-zinc-700 sm:block">
      <div className="flex flex-wrap gap-2">
        <h2 className="text-sm font-semibold">Have you attempted or solved this question?</h2>
        <a
          aria-disabled={progress === "attempted"}
          className={`${linkClassName}`}
          href="#"
          onClick={(event) => {
            event.preventDefault();
            if (progress !== "attempted") updateQuestionProgress(number, "attempted");
          }}
          tabIndex={progress === "attempted" ? -1 : 0}
        >Mark Attempted</a>
        <a
          aria-disabled={progress === "solved"}
          className={`${linkClassName}`}
          href="#"
          onClick={(event) => {
            event.preventDefault();
            if (progress !== "solved") updateQuestionProgress(number, "solved");
          }}
          tabIndex={progress === "solved" ? -1 : 0}
        >Mark Solved</a>
      </div>
    </section>
  );
}
