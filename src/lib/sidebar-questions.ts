import type { Question } from "@/types/types";

const questionNumberCollator = new Intl.Collator(undefined, { numeric: true });

export function compareQuestionNumbers(first: string, second: string) {
  return questionNumberCollator.compare(first, second);
}

export function prepareSidebarQuestions(questions: Question[]) {
  const sorted = [...questions].sort((first, second) =>
    compareQuestionNumbers(first.question_number, second.question_number),
  );
  return sorted.map((question) => ({ question, searchTitle: question.name.toLowerCase() }));
}
