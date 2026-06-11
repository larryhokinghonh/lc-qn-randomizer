"use client";

import { useState } from "react";

import {
  getFilteredQuestions,
} from "@/lib/question-utils";
import type {
  Difficulty,
  Question,
  QuestionTopic,
  SpecialTopic,
} from "@/types/types";

export function useQuestionFilters(questions: Question[]) {
  const [selectedSpecialTopics, setSelectedSpecialTopics] = useState<
    SpecialTopic[]
  >([]);
  const [selectedQuestionTopics, setSelectedQuestionTopics] = useState<
    QuestionTopic[]
  >([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<
    Difficulty[]
  >([]);
  const [topicSearch, setTopicSearch] = useState("");

  const specialTopics = Array.from(
    new Set(questions.flatMap((question) => question.special_topics)),
  ).sort();
  const questionTopics = Array.from(
    new Set(questions.flatMap((question) => question.topics)),
  ).sort();
  const questionPool = getFilteredQuestions(
    questions,
    selectedSpecialTopics,
    selectedQuestionTopics,
    selectedDifficulties,
  );
  const filteredQuestionTopics = questionTopics.filter((topic) =>
    topic.toLowerCase().includes(topicSearch.trim().toLowerCase()),
  );

  function toggleSpecialTopic(topic: SpecialTopic) {
    setSelectedSpecialTopics((currentTopics) =>
      currentTopics.includes(topic)
        ? currentTopics.filter((currentTopic) => currentTopic !== topic)
        : [...currentTopics, topic],
    );
  }

  function toggleQuestionTopic(topic: QuestionTopic) {
    setSelectedQuestionTopics((currentTopics) =>
      currentTopics.includes(topic)
        ? currentTopics.filter((currentTopic) => currentTopic !== topic)
        : [...currentTopics, topic],
    );
  }

  function toggleDifficulty(difficulty: Difficulty) {
    setSelectedDifficulties((currentDifficulties) =>
      currentDifficulties.includes(difficulty)
        ? currentDifficulties.filter(
            (currentDifficulty) => currentDifficulty !== difficulty,
          )
        : [...currentDifficulties, difficulty],
    );
  }

  function clearQuestionTopics() {
    setSelectedQuestionTopics([]);
  }

  return {
    clearQuestionTopics,
    filteredQuestionTopics,
    questionPool,
    selectedDifficulties,
    selectedQuestionTopics,
    selectedSpecialTopics,
    setTopicSearch,
    specialTopics,
    toggleDifficulty,
    toggleQuestionTopic,
    toggleSpecialTopic,
    topicSearch,
  };
}
