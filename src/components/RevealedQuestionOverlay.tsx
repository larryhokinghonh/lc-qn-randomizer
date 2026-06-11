"use client";

import FadeContent from "@/components/FadeContent";
import {
  getDifficultyColorClass,
  REVEAL_FADE_DURATION,
} from "@/lib/question-utils";
import type { Question } from "@/types/types";

type RevealedQuestionOverlayProps = {
  isVisible: boolean;
  question: Question;
};

export default function RevealedQuestionOverlay({
  isVisible,
  question,
}: RevealedQuestionOverlayProps) {
  return (
    <div className="absolute inset-x-5 bottom-5 top-5 overflow-hidden sm:inset-x-8 sm:bottom-auto sm:top-8">
      <FadeContent
        blur
        duration={REVEAL_FADE_DURATION}
        isVisible={isVisible}
      >
        <section className="max-h-full overflow-y-auto px-4 py-6 sm:relative sm:flex sm:min-h-44 sm:items-center sm:overflow-hidden sm:px-8">
          <a
            className="flex w-full flex-col gap-4 sm:block"
            href={question.url}
            rel="noreferrer"
            target="_blank"
          >
            <p
              className={`flex flex-wrap items-center gap-2 text-sm font-medium transition-colors duration-300 sm:absolute sm:left-8 sm:right-8 sm:top-4 ${getDifficultyColorClass(question.difficulty)}`}
            >
              <span>
                Question {question.question_number} {" "}/{" "}
                {question.difficulty}
              </span>
              {question.needs_premium && (
                <span className="inline-flex border border-[#ffa116] px-2 py-0.5 text-xs font-semibold text-[#ffa116]">
                  PREMIUM
                </span>
              )}
            </p>
            <span
              aria-hidden="true"
              className="block h-8 text-2xl font-semibold opacity-0 sm:h-auto sm:text-4xl"
            >
              &nbsp;
            </span>
            <p className="break-words text-sm text-zinc-300 sm:absolute sm:bottom-4 sm:left-8 sm:right-8">
              {question.topics.length > 0
                ? question.topics.join(" / ")
                : "No topics assigned."}
            </p>
          </a>
        </section>
      </FadeContent>
    </div>
  );
}
