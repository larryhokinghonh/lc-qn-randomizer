"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import type { Theme } from "@/types/types";

import ThemeToggle from "./ThemeToggle";

type ScrollNavbarProps = {
  onToggleTheme: () => void;
  theme: Theme;
  titleId: string;
};

export default function ScrollNavbar({
  onToggleTheme,
  theme,
  titleId,
}: ScrollNavbarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const title = document.getElementById(titleId);

    if (!title) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
    });

    observer.observe(title);

    return () => observer.disconnect();
  }, [titleId]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          animate={{ opacity: 1, y: 0 }}
          aria-label="Site navigation"
          className="fixed inset-x-0 top-0 z-50 border-b border-zinc-300/70 bg-transparent pt-[env(safe-area-inset-top)] shadow-lg/15 backdrop-blur-xl dark:border-zinc-700/70"
          exit={{ opacity: 0, y: -16 }}
          initial={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-4 px-2">
            <Link
              className="min-w-0 truncate text-sm font-semibold text-zinc-950 transition-colors duration-100 dark:text-zinc-50 sm:text-base"
              href="/"
            >
              <span className="text-[#ffa116]">LeetCode</span> Question
              Randomizer
            </Link>

            <div className="hidden shrink-0 sm:block">
              <ThemeToggle onToggle={onToggleTheme} theme={theme} />
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
