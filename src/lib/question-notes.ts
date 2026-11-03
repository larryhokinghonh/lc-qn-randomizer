import type { Question, QuestionNote } from "@/types/types";
import { compareQuestionNumbers } from "@/lib/sidebar-questions";

export const QUESTION_NOTE_KEY_PREFIX = "lc-question-randomizer.note.v1:";

export function questionNoteKey(questionNumber: string) {
  return `${QUESTION_NOTE_KEY_PREFIX}${encodeURIComponent(questionNumber)}`;
}

export function isQuestionNote(value: unknown): value is QuestionNote {
  return (
    typeof value === "object" &&
    value !== null &&
    "question_number" in value &&
    typeof value.question_number === "string" &&
    value.question_number.length > 0 &&
    "name" in value &&
    typeof value.name === "string" &&
    "url" in value &&
    typeof value.url === "string" &&
    "text" in value &&
    typeof value.text === "string"
  );
}

export function formatQuestionNotes(
  notes: Iterable<QuestionNote>,
  questions: Question[],
) {
  const questionsByNumber = new Map(
    questions.map((question) => [question.question_number, question]),
  );

  return Array.from(notes)
    .filter((note) => note.text.trim().length > 0)
    .sort((first, second) => compareQuestionNumbers(first.question_number, second.question_number))
    .map((note) => {
      const question = questionsByNumber.get(note.question_number) ?? note;

      return `Question ${note.question_number}: ${question.name}\n${question.url}\n\n${note.text}`;
    })
    .join("\n\n----------------------------------------\n\n");
}
