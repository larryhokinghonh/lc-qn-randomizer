export type Difficulty = "Easy" | "Medium" | "Hard";

export type Question = {
  name: string;
  question_number: string;
  topics: string[];
  difficulty: Difficulty;
  url: string;
  needs_premium: boolean;
  special_topics: string[];
};

export type QuestionsResponse = {
  questions: Question[];
  synced_at: string;
};

export type CounterResponse = {
  spin_count: number;
};

export type QuestionTopic = string;

export type SpecialTopic = string;

export type Theme = "light" | "dark";
