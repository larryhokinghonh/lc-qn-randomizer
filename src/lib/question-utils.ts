import type {
  Difficulty,
  Question,
  QuestionTopic,
  SpecialTopic,
} from "@/types/types";

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
export const SLOT_SPINS = 16;
export const DEFAULT_SLOT_TEXT = "...";
export const REVEAL_FADE_DURATION = 450;

export type SpinItem = {
  text: string;
  question: Question | null;
};

export function pickQuestion(questionPool: Question[]) {
  return questionPool[Math.floor(Math.random() * questionPool.length)];
}

export function buildSpinItems(
  currentItem: SpinItem,
  selectedQuestion: Question,
  questionPool: Question[],
) {
  return [
    currentItem,
    ...Array.from({ length: SLOT_SPINS - 2 }, () => {
      const question = pickQuestion(questionPool);

      return {
        text: question.name,
        question,
      };
    }),
    {
      text: selectedQuestion.name,
      question: selectedQuestion,
    },
  ];
}

export function buildInitialSpinItems(questions: Question[]) {
  if (questions.length === 0) {
    return [
      {
        text: DEFAULT_SLOT_TEXT,
        question: null,
      },
    ];
  }

  return questions.map((question) => ({
    text: question.name,
    question,
  }));
}

export function getFilteredQuestions(
  sourceQuestions: Question[],
  selectedSpecialTopics: SpecialTopic[],
  selectedQuestionTopics: QuestionTopic[],
  selectedDifficulties: Difficulty[],
) {
  return sourceQuestions.filter(
    (question) =>
      (selectedSpecialTopics.length === 0 ||
        selectedSpecialTopics.some((topic) =>
          question.special_topics.includes(topic),
        )) &&
      (selectedQuestionTopics.length === 0 ||
        selectedQuestionTopics.some((topic) =>
          question.topics.includes(topic),
        )) &&
      (selectedDifficulties.length === 0 ||
        selectedDifficulties.includes(question.difficulty)),
  );
}

export function getDifficultyColorClass(difficulty: Difficulty) {
  if (difficulty === "Easy") {
    return "text-[#1cbaba]";
  }

  if (difficulty === "Medium") {
    return "text-[#ffb700]";
  }

  return "text-[#f63737]";
}
