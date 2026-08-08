"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-center transition-colors duration-300 dark:bg-zinc-800">
      <div className="space-y-4" role="alert">
        <h1 className="text-4xl font-semibold text-[#ffa116] [text-shadow:0_10px_25px_rgb(0_0_0_/_0.25)] sm:text-5xl lg:text-6xl">
          Something went wrong.
        </h1>
        <p className="text-sm font-semibold text-zinc-950 [text-shadow:0_8px_20px_rgb(0_0_0_/_0.25)] sm:text-base lg:text-lg dark:text-zinc-50">
          Refresh the page to try again.
        </p>
      </div>
    </main>
  );
}
