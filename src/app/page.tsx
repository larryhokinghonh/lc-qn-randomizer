"use client";

import Link from "next/link";

import Footer from "@/components/Footer";
import QuestionFilters from "@/components/QuestionFilters";
import ScrollNavbar from "@/components/ScrollNavbar";
import ScrollReveal from "@/components/ScrollReveal";
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
    <div className="flex min-h-screen flex-1 flex-col bg-white font-sans text-zinc-950 transition-colors duration-300 dark:bg-zinc-800 dark:text-zinc-50">
      <ScrollNavbar
        onToggleTheme={toggleTheme}
        theme={theme}
        titleId="site-title"
      />

      <div className="flex min-h-dvh flex-col px-6 py-12">
        <nav className="mx-auto mb-8 hidden w-full max-w-4xl items-center justify-end sm:flex">
          <ThemeToggle onToggle={toggleTheme} theme={theme} />
        </nav>

        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-8">
          <header className="space-y-2 px-2">
            <h1
              className="text-3xl font-semibold text-zinc-950 transition-colors duration-100 dark:text-zinc-50 sm:text-4xl"
              id="site-title"
            >
              <Link href="/">
                <span className="text-[#ffa116]">LeetCode</span> Question
                Randomizer
              </Link>
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
      </div>

      <section className="px-6 py-20 sm:py-24" aria-labelledby="why-built">
        <ScrollReveal className="mx-auto w-full max-w-4xl">
          {(isVisible) => {
            const revealClassName = isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0";

            return (
              <>
                <h2
                  className={`text-3xl font-semibold text-[#ffa116] transition-[color,opacity,transform] duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none sm:text-4xl ${revealClassName}`}
                  id="why-built"
                >
                  Why was{" "}
                  <span className="text-zinc-950 dark:text-zinc-50">
                    this built?
                  </span>
                </h2>
                <div className="mt-6 max-w-2xl space-y-5 text-justify text-base leading-7 text-zinc-600 dark:text-zinc-300">
                  <p
                    className={`transition-[color,opacity,transform] delay-100 duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${revealClassName}`}
                  >
                    While preparing for technical interviews and working through
                    LeetCode problems, I noticed that choosing what to practise
                    could become a distraction of its own. I would naturally
                    gravitate towards familiar questions, making it easier to
                    avoid the areas where I needed more practice.
                  </p>
                  <p
                    className={`transition-[color,opacity,transform] delay-200 duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${revealClassName}`}
                  >
                    I built this randomizer to remove that decision without
                    giving up control over what I study. Its filters let you
                    focus on a difficulty, topic, or interview list, while
                    random selection chooses the problem within those
                    boundaries. This makes it easier to start solving, practise
                    less familiar material, and prepare for the uncertainty of
                    technical interviews.
                  </p>
                  <p
                    className={`transition-[color,opacity,transform] delay-300 duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${revealClassName}`}
                  >
                    I hope you find it useful. If you do, please consider
                    sharing it with others. :D
                  </p>
                </div>
              </>
            );
          }}
        </ScrollReveal>
      </section>

      <div className="px-6 pb-12">
        <Footer rollCount={rollCount} />
      </div>
    </div>
  );
}
