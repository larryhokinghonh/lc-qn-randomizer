"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

import type { Theme } from "@/types/types";

type ThemeToggleProps = {
  theme: Theme;
  onToggle: () => void;
};

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
      className="flex cursor-pointer items-center justify-center transition hover:scale-110 active:scale-90"
      onClick={onToggle}
      type="button"
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0, scale: 0 }}
            initial={{ opacity: 0, scale: 0 }}
            key={theme}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Image
              alt="dark-mode"
              className="block dark:hidden"
              height={22}
              src="/dark-mode.svg"
              width={22}
            />
            <Image
              alt="light-mode"
              className="hidden dark:block"
              height={22}
              src="/light-mode.svg"
              width={22}
            />
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
