"use client";

import Footer from "@/components/Footer";
import QuestionFilters from "@/components/QuestionFilters";
import SlotCard from "@/components/SlotCard";
import ThemeToggle from "@/components/ThemeToggle";
import { useQuestionFilters } from "@/hooks/useQuestionFilters";
import { useQuestionsData } from "@/hooks/useQuestionsData";
import { useSlotMachine } from "@/hooks/useSlotMachine";
import { useTheme } from "@/hooks/useTheme";

export default function Home() {
  const {
    dataError,
    incrementRollCount,
    isLoadingQuestions,
    questions,
    rollCount,
  } = useQuestionsData();
  const {
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
  } = useQuestionFilters(questions);
  const {
    clearFilterWarning,
    currentSlotQuestion,
    filterWarning,
    handleRandomize,
    handleSlotTextChange,
    handleSpinTextAnimationComplete,
    hasRandomized,
    isQuestionVisible,
    isSlotLanded,
    isSpinning,
    revealedQuestion,
    spinItems,
    spinKey,
  } = useSlotMachine(questions, questionPool, incrementRollCount);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white px-6 py-12 font-sans text-zinc-950 transition-colors duration-300 dark:bg-zinc-800 dark:text-zinc-50">
      <nav className="mx-auto mb-8 hidden w-full max-w-4xl items-center justify-end sm:flex">
        <ThemeToggle onToggle={toggleTheme} theme={theme} />
      </nav>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-8">
        <header className="px-2 space-y-2">
          <h1 className="text-3xl font-semibold text-zinc-950 transition-colors duration-100 dark:text-zinc-50 sm:text-4xl">
            <span className="text-[#ffa116]">LeetCode</span> Question Randomizer
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600 transition-colors duration-100 dark:text-zinc-300">
            Randomly get LeetCode questions to practice on.
          </p>
        </header>

        <QuestionFilters
          filteredQuestionTopics={filteredQuestionTopics}
          isSpinning={isSpinning}
          onClearFilterWarning={clearFilterWarning}
          onClearQuestionTopics={clearQuestionTopics}
          onToggleDifficulty={toggleDifficulty}
          onToggleQuestionTopic={toggleQuestionTopic}
          onToggleSpecialTopic={toggleSpecialTopic}
          onTopicSearchChange={setTopicSearch}
          selectedDifficulties={selectedDifficulties}
          selectedQuestionTopics={selectedQuestionTopics}
          selectedSpecialTopics={selectedSpecialTopics}
          specialTopics={specialTopics}
          topicSearch={topicSearch}
        />

        <SlotCard
          currentSlotQuestion={currentSlotQuestion}
          dataError={dataError}
          filterWarning={filterWarning}
          handleRandomize={handleRandomize}
          hasRandomized={hasRandomized}
          isLoadingQuestions={isLoadingQuestions}
          isQuestionVisible={isQuestionVisible}
          isSlotLanded={isSlotLanded}
          isSpinning={isSpinning}
          onSlotTextChange={handleSlotTextChange}
          onSpinTextAnimationComplete={handleSpinTextAnimationComplete}
          revealedQuestion={revealedQuestion}
          spinItems={spinItems}
          spinKey={spinKey}
        />

        {dataError && (
          <div
            className="border border-red-500 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900 transition-colors duration-100 dark:border-red-400 dark:bg-red-950 dark:text-red-100"
            role="alert"
          >
            {dataError}
          </div>
        )}
      </main>

      <Footer rollCount={rollCount} />
    </div>
  );
}
