"use client";

import RotatingText from "@/components/RotatingText";
import ShinyText from "@/components/ShinyText/ShinyText";
import { REVEAL_FADE_DURATION, type SpinItem } from "@/lib/question-utils";
import type { Question } from "@/types/types";

import RevealedQuestionOverlay from "./RevealedQuestionOverlay";

type SlotCardProps = {
  currentSlotQuestion: Question | null;
  dataError: string;
  filterWarning: boolean;
  handleRandomize: (
    isLoadingQuestions: boolean,
    dataError: string,
    revealFadeDuration: number,
  ) => void;
  hasRandomized: boolean;
  isLoadingQuestions: boolean;
  isQuestionVisible: boolean;
  isSlotLanded: boolean;
  isSpinning: boolean;
  onSpinTextAnimationComplete: (index: number) => void;
  onSlotTextChange: (index: number) => void;
  revealedQuestion: Question | null;
  spinItems: SpinItem[];
  spinKey: number;
};

export default function SlotCard({
  currentSlotQuestion,
  dataError,
  filterWarning,
  handleRandomize,
  hasRandomized,
  isLoadingQuestions,
  isQuestionVisible,
  isSlotLanded,
  isSpinning,
  onSpinTextAnimationComplete,
  onSlotTextChange,
  revealedQuestion,
  spinItems,
  spinKey,
}: SlotCardProps) {
  const slotText = (
    <RotatingText
      key={`${hasRandomized ? "spin" : "idle"}-${spinKey}`}
      texts={spinItems.map((spinItem) => spinItem.text)}
      loop={!hasRandomized}
      rotationInterval={hasRandomized ? 100 : 2500}
      splitBy="words"
      staggerDuration={50}
      staggerFrom="last"
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "-120%", opacity: 0 }}
      onNext={onSlotTextChange}
      onTextAnimationComplete={onSpinTextAnimationComplete}
      mainClassName="w-full text-zinc-200"
      splitLevelClassName="w-full"
    />
  );
  const slotUrl = currentSlotQuestion?.url;

  return (
    <>
      <section
        aria-label="Question randomizer"
        className="relative overflow-hidden border border-zinc-300 rounded-2xl bg-black p-5 shadow-2xl/35 transition-colors duration-300 dark:border-zinc-700 sm:p-8"
      >
        {revealedQuestion && (
          <RevealedQuestionOverlay
            isVisible={isQuestionVisible}
            question={revealedQuestion}
          />
        )}

        <div
          className={`relative mb-6 flex min-h-36 items-center overflow-hidden px-4 py-6 text-2xl font-semibold transition-colors duration-500 sm:min-h-44 sm:px-8 sm:text-4xl ${
            isSlotLanded ? "text-[#ffa116]" : "text-zinc-950 dark:text-white"
          }`}
        >
          {slotUrl ? (
            <a
              className="block w-full transition hover:text-[#ffa116]"
              href={slotUrl}
              rel="noreferrer"
              target="_blank"
            >
              {slotText}
            </a>
          ) : (
            slotText
          )}
        </div>

        <div className="px-4 sm:px-8">
          <button
            className="relative h-12 border border-zinc-300 rounded-lg bg-zinc-900 px-4 font-semibold text-zinc-200 transition dark:border-zinc-700 cursor-pointer"
            disabled={isSpinning || isLoadingQuestions || Boolean(dataError)}
            onClick={() =>
              handleRandomize(
                isLoadingQuestions,
                dataError,
                REVEAL_FADE_DURATION,
              )
            }
            type="button"
          >
            <ShinyText
              disabled={isSpinning || isLoadingQuestions || Boolean(dataError)}
              text={isLoadingQuestions ? "Loading questions" : "Randomize question"}
            />
          </button>
        </div>
      </section>

      {filterWarning && (
        <div
          className="mb-5 border border-amber-500 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 transition-colors duration-300 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-100"
          role="alert"
        >
          No questions match the selected filters. Adjust the filters and try
          again.
        </div>
      )}
    </>
  );
}
