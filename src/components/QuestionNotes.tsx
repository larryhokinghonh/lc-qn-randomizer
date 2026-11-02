"use client";

import { useEffect, useId } from "react";

import { useQuestionNote } from "@/hooks/useQuestionNotes";
import { flushQuestionNotes } from "@/lib/question-notes-store";
import type { Question } from "@/types/types";

type QuestionNotesProps = {
  question: Question;
};

export default function QuestionNotes({ question }: QuestionNotesProps) {
  const { text, setText } = useQuestionNote(question);
  const id = useId();
  useEffect(() => flushQuestionNotes, []);

  return (
    <div className="space-y-2">
      <label className="block font-semibold" htmlFor={id}>Notes</label>
      <textarea
        className="block h-[calc(4lh+1.5rem+2px)] min-h-[calc(4lh+1.5rem+2px)] w-full resize-y overflow-y-auto rounded-lg border border-zinc-300 bg-white px-3 py-3 text-sm leading-5 text-zinc-950 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-400"
        id={id}
        onBlur={flushQuestionNotes}
        onChange={(event) => setText(event.target.value)}
        placeholder="Write your notes…"
        value={text}
      />
    </div>
  );
}
