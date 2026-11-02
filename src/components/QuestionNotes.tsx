"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";

type QuestionNotesProps = {
  onChange: (value: string) => void;
  questionNumber: string;
  value: string;
};

function fitEditor(editor: HTMLTextAreaElement) {
  editor.style.height = "auto";
  editor.style.height = `${editor.scrollHeight + 2}px`;
}

export default function QuestionNotes({
  onChange,
  questionNumber,
  value,
}: QuestionNotesProps) {
  const id = useId();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (editorRef.current) {
      fitEditor(editorRef.current);
    }
  }, [value]);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    let previousWidth = editor.clientWidth;
    const observer = new ResizeObserver(() => {
      if (editor.clientWidth !== previousWidth) {
        previousWidth = editor.clientWidth;
        fitEditor(editor);
      }
    });
    observer.observe(editor);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-2">
      <label className="block font-semibold" htmlFor={id}>
        Notes<span className="sr-only"> for question {questionNumber}</span>
      </label>
      <textarea
        className="block w-full resize-none overflow-hidden rounded-lg border border-zinc-300 bg-white px-3 py-3 text-sm leading-5 text-zinc-950 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffa116] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-400"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write your notes…"
        ref={editorRef}
        rows={4}
        value={value}
      />
    </div>
  );
}
