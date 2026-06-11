"use client";

import {
  AnimatePresence,
  motion,
  type HTMLMotionProps,
  type Target,
  type TargetAndTransition,
  type Transition,
  type VariantLabels,
} from "motion/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

function cn(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

interface RotatingTextProps
  extends Omit<
    HTMLMotionProps<"span">,
    "children" | "transition" | "initial" | "animate" | "exit"
  > {
  texts: string[];
  transition?: Transition;
  initial?: boolean | Target | VariantLabels;
  animate?: boolean | VariantLabels | TargetAndTransition;
  exit?: Target | VariantLabels;
  animatePresenceMode?: "sync" | "wait";
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: "characters" | "words" | "lines" | string;
  onNext?: (index: number) => void;
  onTextAnimationComplete?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      rotationInterval = 2000,
      staggerDuration = 0,
      staggerFrom = "first",
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      onTextAnimationComplete,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      ...rest
    },
    ref,
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const onNextRef = useRef(onNext);
    const notifiedTextIndexRef = useRef(0);

    useEffect(() => {
      onNextRef.current = onNext;
    }, [onNext]);

    useEffect(() => {
      if (notifiedTextIndexRef.current === currentTextIndex) {
        return;
      }

      notifiedTextIndexRef.current = currentTextIndex;
      onNextRef.current?.(currentTextIndex);
    }, [currentTextIndex]);

    const splitIntoCharacters = (text: string) => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

        return Array.from(segmenter.segment(text), (segment) => segment.segment);
      }

      return Array.from(text);
    };

    const elements = useMemo(() => {
      const currentText = texts[currentTextIndex] ?? "";

      if (splitBy === "characters") {
        const words = currentText.split(" ");

        return words.map((word, index) => ({
          characters: splitIntoCharacters(word),
          needsSpace: index !== words.length - 1,
        }));
      }

      if (splitBy === "words") {
        const words = currentText.split(" ");

        return words.map((word, index) => ({
          characters: [word],
          needsSpace: index !== words.length - 1,
        }));
      }

      if (splitBy === "lines") {
        const lines = currentText.split("\n");

        return lines.map((line, index) => ({
          characters: [line],
          needsSpace: index !== lines.length - 1,
        }));
      }

      const parts = currentText.split(splitBy);

      return parts.map((part, index) => ({
        characters: [part],
        needsSpace: index !== parts.length - 1,
      }));
    }, [currentTextIndex, splitBy, texts]);

    const getStaggerDelay = useCallback(
      (index: number, totalChars: number) => {
        if (staggerFrom === "first") {
          return index * staggerDuration;
        }

        if (staggerFrom === "last") {
          return (totalChars - 1 - index) * staggerDuration;
        }

        if (staggerFrom === "center") {
          const center = Math.floor(totalChars / 2);

          return Math.abs(center - index) * staggerDuration;
        }

        if (staggerFrom === "random") {
          const randomIndex = Math.floor(Math.random() * totalChars);

          return Math.abs(randomIndex - index) * staggerDuration;
        }

        return Math.abs(staggerFrom - index) * staggerDuration;
      },
      [staggerDuration, staggerFrom],
    );

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
      },
      [],
    );

    const next = useCallback(() => {
      const nextIndex =
        currentTextIndex === texts.length - 1
          ? loop
            ? 0
            : currentTextIndex
          : currentTextIndex + 1;

      if (nextIndex !== currentTextIndex) {
        handleIndexChange(nextIndex);
      }
    }, [currentTextIndex, handleIndexChange, loop, texts.length]);

    const previous = useCallback(() => {
      const previousIndex =
        currentTextIndex === 0
          ? loop
            ? texts.length - 1
            : currentTextIndex
          : currentTextIndex - 1;

      if (previousIndex !== currentTextIndex) {
        handleIndexChange(previousIndex);
      }
    }, [currentTextIndex, handleIndexChange, loop, texts.length]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));

        if (validIndex !== currentTextIndex) {
          handleIndexChange(validIndex);
        }
      },
      [currentTextIndex, handleIndexChange, texts.length],
    );

    const reset = useCallback(() => {
      if (currentTextIndex !== 0) {
        handleIndexChange(0);
      }
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [
      jumpTo,
      next,
      previous,
      reset,
    ]);

    useEffect(() => {
      if (!auto || texts.length < 2) {
        return;
      }

      const intervalId = setInterval(() => {
        setCurrentTextIndex((currentIndex) => {
          const nextIndex =
            currentIndex === texts.length - 1
              ? loop
                ? 0
                : currentIndex
              : currentIndex + 1;

          return nextIndex;
        });
      }, rotationInterval);

      return () => clearInterval(intervalId);
    }, [auto, loop, rotationInterval, texts.length]);

    const totalChars = elements.reduce(
      (total, element) => total + element.characters.length,
      0,
    );

    return (
      <motion.span className={cn("inline-flex flex-wrap", mainClassName)} {...rest}>
        <AnimatePresence
          initial={animatePresenceInitial}
          mode={animatePresenceMode}
        >
          <motion.span
            key={currentTextIndex}
            aria-label={texts[currentTextIndex]}
            className={cn("inline-flex flex-wrap", splitLevelClassName)}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={transition}
            onAnimationComplete={() =>
              onTextAnimationComplete?.(currentTextIndex)
            }
          >
            {elements.map((word, wordIndex, words) => {
              const previousCharsCount = words
                .slice(0, wordIndex)
                .reduce((total, item) => total + item.characters.length, 0);

              return (
                <span className="inline-flex" key={`${wordIndex}-${word.characters.join("")}`}>
                  {word.characters.map((character, characterIndex) => (
                    <motion.span
                      aria-hidden="true"
                      className={cn("inline-block", elementLevelClassName)}
                      key={`${character}-${characterIndex}`}
                      transition={{
                        ...transition,
                        delay: getStaggerDelay(
                          previousCharsCount + characterIndex,
                          totalChars,
                        ),
                      }}
                    >
                      {character}
                    </motion.span>
                  ))}
                  {word.needsSpace && (
                    <span aria-hidden="true" className="whitespace-pre">
                      {" "}
                    </span>
                  )}
                </span>
              );
            })}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    );
  },
);

RotatingText.displayName = "RotatingText";

export default RotatingText;
