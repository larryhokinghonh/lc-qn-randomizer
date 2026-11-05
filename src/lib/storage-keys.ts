export const STORAGE_KEYS = {
  questions: "lcqnrandomizer.questions",
  syncedAt: "lcqnrandomizer.synced-at",
  questionsVersion: "lcqnrandomizer.questions-version",
  progress: "lcqnrandomizer.progress.v1",
  customPool: "lcqnrandomizer.custom-pool.v1",
  notePrefix: "lcqnrandomizer.note.v1:",
} as const;

export const LEGACY_STORAGE_KEYS = {
  questions: "lc-question-randomizer.questions",
  syncedAt: "lc-question-randomizer.synced-at",
  questionsVersion: "lc-question-randomizer.questions-version",
  progressPrefix: "lc-question-randomizer.progress.v1:",
  notePrefix: "lc-question-randomizer.note.v1:",
} as const;

export function getStorageKeys(storage: Storage) {
  return Array.from({ length: storage.length }, (_, index) => storage.key(index))
    .filter((key): key is string => key !== null);
}
