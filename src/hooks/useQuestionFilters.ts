"use client";

import { useState } from "react";

import { useQuestionProgressStatus } from "@/hooks/useQuestionProgress";
import { getEligibleQuestions } from "@/lib/question-progress";
import {
  getFilteredQuestions,
  getTopicQuestionCounts,
} from "@/lib/question-utils";
import type {
  Difficulty,
  Question,
  QuestionTopic,
  SpecialTopic,
} from "@/types/types";

export function useQuestionFilters(questions: Question[]) {
  const { isLoaded: isProgressLoaded, stages, progressError } = useQuestionProgressStatus();
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
  const [includeZeroCountTopics, setIncludeZeroCountTopics] = useState(false);

  const specialTopics = Array.from(
    new Set(questions.flatMap((question) => question.special_topics)),
  ).sort();
  const availableSelectedSpecialTopics = selectedSpecialTopics.filter((topic) =>
    specialTopics.includes(topic),
  );
  const questionTopics = Array.from(
    new Set(questions.flatMap((question) => question.topics)),
  ).sort();
  const questionPool = getFilteredQuestions(
    questions,
    availableSelectedSpecialTopics,
    selectedQuestionTopics,
    selectedDifficulties,
  );
  const eligibleQuestionPool = getEligibleQuestions(questionPool, stages);
  const topicQuestionCounts = getTopicQuestionCounts(
    questions,
    availableSelectedSpecialTopics,
    selectedDifficulties,
    stages,
  );
  const filteredQuestionTopics = questionTopics.filter((topic) =>
    (includeZeroCountTopics || (topicQuestionCounts.get(topic) ?? 0) > 0) &&
    topic.toLowerCase().includes(topicSearch.trim().toLowerCase()),
  );

  function toggleSpecialTopic(topic: SpecialTopic) {
    setSelectedSpecialTopics((currentTopics) => {
      const availableTopics = currentTopics.filter((currentTopic) =>
        specialTopics.includes(currentTopic),
      );
      return availableTopics.includes(topic)
        ? availableTopics.filter((currentTopic) => currentTopic !== topic)
        : [...availableTopics, topic];
    });
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
    eligibleQuestionPool,
    filteredQuestionTopics,
    includeZeroCountTopics,
    isProgressLoaded,
    progressError,
    questionPool,
    selectedDifficulties,
    selectedQuestionTopics,
    selectedSpecialTopics: availableSelectedSpecialTopics,
    setTopicSearch,
    setIncludeZeroCountTopics,
    specialTopics,
    toggleDifficulty,
    toggleQuestionTopic,
    toggleSpecialTopic,
    topicQuestionCounts,
    topicSearch,
  };
}
