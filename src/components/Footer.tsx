"use client";

import { useEffect, useState } from "react";

import quotes from "../../data/quotes.json";

function pickQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)] ?? "";
}

type FooterProps = {
  rollCount: number;
};

export default function AppFooter({ rollCount }: FooterProps) {
  const [footerQuote, setFooterQuote] = useState("");

  useEffect(() => {
    const quoteTimeoutId = window.setTimeout(() => {
      setFooterQuote(pickQuote());
    }, 0);

    return () => window.clearTimeout(quoteTimeoutId);
  }, []);

  return (
    <footer className="mx-auto mt-10 flex w-full max-w-4xl items-center justify-between gap-6">
      <p className="max-w-2xl text-sm leading-6 text-zinc-600 transition-colors duration-100 dark:text-zinc-300">
        {footerQuote}
      </p>
      <span className="text-sm font-semibold text-[#ffa116]">
        {rollCount.toLocaleString()}
      </span>
    </footer>
  );
}
