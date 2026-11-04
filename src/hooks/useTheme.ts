"use client";

import { useEffect, useRef, useState } from "react";

import type { Theme } from "@/types/types";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");
  const soundsRef = useRef<Record<Theme, HTMLAudioElement> | null>(null);

  useEffect(() => {
    const sounds = {
      light: new Audio("/toggle-light-mode.wav"),
      dark: new Audio("/toggle-dark-mode.wav"),
    };
    soundsRef.current = sounds;

    return () => {
      Object.values(sounds).forEach((sound) => sound.pause());
      soundsRef.current = null;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);

    const sounds = soundsRef.current;

    if (!sounds) {
      return;
    }

    Object.values(sounds).forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });

    void sounds[nextTheme].play().catch(() => {});
  }

  return {
    theme,
    toggleTheme,
  };
}
