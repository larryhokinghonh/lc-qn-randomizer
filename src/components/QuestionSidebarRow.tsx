"use client";

import QuestionNotes from "@/components/QuestionNotes";
import { QuestionProgressSelect } from "@/components/QuestionProgress";
import { getDifficultyColorClass } from "@/lib/question-utils";
import type { Question } from "@/types/types";

type QuestionSidebarRowProps = {
  id: string;
  question: Question;
  isExpanded: boolean;
  onToggle: (number: string) => void;
};

export default function QuestionSidebarRow({ id, question, isExpanded, onToggle }: QuestionSidebarRowProps) {
  const detailsId = `${id}-question-${encodeURIComponent(question.question_number)}`;
  return (
    <>
      <div className="flex min-h-16 items-start gap-2 px-6 py-4">
        <button
          aria-controls={detailsId}
          aria-expanded={isExpanded}
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 py-1.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#ffa116] motion-reduce:transition-none"
          onClick={() => onToggle(question.question_number)}
          type="button"
        >
          <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">{question.question_number}.</span>
          <span className="min-w-0 flex-1 wrap-break-word font-semibold">
            {question.name}
            {question.needs_premium ? <span className="mt-1 block text-xs font-medium text-[#9a5800] dark:text-[#ffa116]">Premium</span> : null}
          </span>
          <span aria-hidden="true" className={`mt-1 shrink-0 transition-transform motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`}>
            <svg fill="none" height="14" viewBox="0 0 24 24" width="14">
              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </span>
        </button>
        <QuestionProgressSelect question={question} />
      </div>
      <div className="space-y-4 px-6 pt-2 pb-6 text-xs leading-5" hidden={!isExpanded} id={detailsId}>
        {isExpanded ? (
          <>
            <p className={`inline-flex rounded bg-zinc-950 px-2 py-0.5 font-semibold ${getDifficultyColorClass(question.difficulty)}`}>{question.difficulty}</p>
            <dl className="space-y-3">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Topics</dt>
                <dd className="wrap-break-word">{question.topics.length > 0 ? question.topics.join(" / ") : "No topics assigned."}</dd>
              </div>
              {question.special_topics.length > 0 ? (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Lists</dt>
                  <dd className="wrap-break-word">{question.special_topics.join(" / ")}</dd>
                </div>
              ) : null}
            </dl>
            <QuestionNotes question={question} />
            <a
              className="inline-flex min-h-9 items-center rounded border border-zinc-300 px-3 font-semibold hover:border-[#ffa116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116] dark:border-zinc-600"
              href={question.url}
              rel="noreferrer"
              target="_blank"
            >Go to Question</a>
          </>
        ) : null}
      </div>
    </>
  );
}
