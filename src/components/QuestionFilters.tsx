"use client";

import { useEffect, useRef, useState } from "react";

import { DIFFICULTIES, getDifficultyColorClass } from "@/lib/question-utils";
import type {
  Difficulty,
  QuestionTopic,
  SpecialTopic,
} from "@/types/types";

type QuestionFiltersProps = {
  filteredQuestionTopics: QuestionTopic[];
  isSpinning: boolean;
  onClearFilterWarning: () => void;
  onClearQuestionTopics: () => void;
  onTopicSearchChange: (topicSearch: string) => void;
  onToggleDifficulty: (difficulty: Difficulty) => void;
  onToggleQuestionTopic: (topic: QuestionTopic) => void;
  onToggleSpecialTopic: (topic: SpecialTopic) => void;
  selectedDifficulties: Difficulty[];
  selectedQuestionTopics: QuestionTopic[];
  selectedSpecialTopics: SpecialTopic[];
  specialTopics: SpecialTopic[];
  topicSearch: string;
};

export default function QuestionFilters({
  filteredQuestionTopics,
  isSpinning,
  onClearFilterWarning,
  onClearQuestionTopics,
  onTopicSearchChange,
  onToggleDifficulty,
  onToggleQuestionTopic,
  onToggleSpecialTopic,
  selectedDifficulties,
  selectedQuestionTopics,
  selectedSpecialTopics,
  specialTopics,
  topicSearch,
}: QuestionFiltersProps) {
  const topicDropdownRef = useRef<HTMLDivElement>(null);
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isTopicDropdownOpen) {
      return;
    }

    function handleOutsideClick(event: PointerEvent) {
      if (
        topicDropdownRef.current &&
        !topicDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTopicDropdownOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [isTopicDropdownOpen]);

  function clearQuestionTopics() {
    onClearFilterWarning();
    onClearQuestionTopics();
  }

  function toggleQuestionTopic(topic: QuestionTopic) {
    onClearFilterWarning();
    onToggleQuestionTopic(topic);
  }

  function toggleDifficulty(difficulty: Difficulty) {
    onClearFilterWarning();
    onToggleDifficulty(difficulty);
  }

  function toggleSpecialTopic(topic: SpecialTopic) {
    onClearFilterWarning();
    onToggleSpecialTopic(topic);
  }

  return (
    <section
      aria-label="Question filters"
      className="overflow-visible transition-colors duration-300 dark:border-zinc-700 sm:p-2"
    >
      <div className="mb-2 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative z-10 flex-1" ref={topicDropdownRef}>
            <button
              className="flex h-12 w-full items-center justify-between border border-zinc-300 rounded-xl bg-black px-4 text-left text-sm font-semibold text-zinc-200 shadow-2xl/35 transition hover:border-[#ffa116] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:text-zinc-200"
              disabled={isSpinning}
              onClick={() =>
                setIsTopicDropdownOpen((currentValue) => !currentValue)
              }
              type="button"
            >
              <span>Search and select topics</span>
            </button>

            {isTopicDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 border border-zinc-300 rounded-xl bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                <input
                  className="mb-3 h-11 w-full border border-zinc-300 rounded-lg bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#ffa116] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                  onChange={(event) => onTopicSearchChange(event.target.value)}
                  onFocus={() => setIsTopicDropdownOpen(true)}
                  placeholder="Search topics"
                  type="search"
                  value={topicSearch}
                />
                <div className="scrollbar-none max-h-56 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-20px),transparent)] [webkit-mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-20px),transparent)]">
                  {filteredQuestionTopics.map((topic) => {
                    const isSelected = selectedQuestionTopics.includes(topic);

                    return (
                      <label
                        className={`flex min-h-10 cursor-pointer items-center gap-3 px-2 text-sm font-semibold transition last:border-b-0 dark:border-zinc-800 ${
                          isSelected
                            ? "text-[#ffa116]"
                            : "text-zinc-700 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-zinc-50"
                        }`}
                        key={topic}
                      >
                        <input
                          checked={isSelected}
                          disabled={isSpinning}
                          onChange={() => toggleQuestionTopic(topic)}
                          type="checkbox"
                        />
                        {topic}
                      </label>
                    );
                  })}
                  {filteredQuestionTopics.length === 0 && (
                    <p className="px-2 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                      No matching topics.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            className="h-12 rounded-xl bg-zinc-700 px-4 text-sm font-semibold text-zinc-200 shadow-2xl/35 transition hover:border-[#ffa116] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSpinning || selectedQuestionTopics.length === 0}
            onClick={clearQuestionTopics}
            type="button"
          >
            Clear topics
          </button>
        </div>
      </div>

      {selectedQuestionTopics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedQuestionTopics.map((topic) => (
            <button
              className="inline-flex min-h-9 rounded-lg bg-black cursor-pointer items-center border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-200 shadow-2xl/35 transition disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:hover:border-[#ffa116]"
              disabled={isSpinning}
              key={topic}
              onClick={() => toggleQuestionTopic(topic)}
              type="button"
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      <div className="my-5 flex flex-wrap items-center gap-3">
        {DIFFICULTIES.map((difficulty) => {
          const isSelected = selectedDifficulties.includes(difficulty);

          return (
            <label
              className={`inline-flex h-10 rounded-lg cursor-pointer items-center gap-2 border px-4 text-sm font-semibold shadow-2xl/35 transition ${
                isSelected
                  ? `${getDifficultyColorClass(difficulty)} border-current bg-transparent`
                  : "border-zinc-300 bg-black text-zinc-200 hover:border-[#ffa116] dark:border-zinc-700"
              } ${isSpinning ? "cursor-not-allowed opacity-70" : ""}`}
              key={difficulty}
            >
              <input
                checked={isSelected}
                className="sr-only"
                disabled={isSpinning}
                onChange={() => toggleDifficulty(difficulty)}
                type="checkbox"
              />
              {difficulty}
            </label>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {specialTopics.map((topic) => {
          const isSelected = selectedSpecialTopics.includes(topic);

          return (
            <label
              className={`inline-flex h-10 cursor-pointer items-center gap-2 border px-4 text-sm font-semibold rounded-lg bg-black shadow-2xl/35 transition text-zinc-200 ${
                isSelected
                  ? "border-[#ffa116]"
                  : "border-zinc-300 hover:border-[#ffa116] dark:border-zinc-700"
              } ${isSpinning ? "cursor-not-allowed opacity-70" : ""}`}
              key={topic}
            >
              <input
                checked={isSelected}
                className="sr-only"
                disabled={isSpinning}
                onChange={() => toggleSpecialTopic(topic)}
                type="checkbox"
              />
              {topic}
            </label>
          );
        })}
      </div>
    </section>
  );
}
