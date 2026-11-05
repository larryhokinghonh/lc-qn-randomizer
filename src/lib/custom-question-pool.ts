import type { Question } from "@/types/types";

export function parseCustomQuestionPool(raw: string | null): string[] {
  if (raw === null) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((number): number is string =>
      typeof number === "string" && number.trim().length > 0,
    ))];
  } catch {
    return [];
  }
}

export function resolveCustomQuestions(questions: Question[], numbers: readonly string[]) {
  const byNumber = new Map(questions.map((question) => [question.question_number, question]));
  return numbers.flatMap((number) => {
    const question = byNumber.get(number);
    return question ? [question] : [];
  });
}

export function getRandomizationPools(
  questions: Question[],
  questionPool: Question[],
  eligibleQuestionPool: Question[],
  customQuestions: Question[],
  isTabletOrDesktop: boolean,
) {
  const isCustomPoolActive = isTabletOrDesktop && customQuestions.length > 0;
  return {
    isCustomPoolActive,
    idleQuestions: isCustomPoolActive ? customQuestions : questions,
    questionPool: isCustomPoolActive ? customQuestions : questionPool,
    eligibleQuestionPool: isCustomPoolActive ? customQuestions : eligibleQuestionPool,
  };
}
