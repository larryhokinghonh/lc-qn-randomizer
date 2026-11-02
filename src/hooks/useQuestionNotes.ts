"use client";

import { useSyncExternalStore } from "react";

import {
  formatQuestionNotes,
  isQuestionNote,
  QUESTION_NOTE_KEY_PREFIX,
  questionNoteKey,
} from "@/lib/question-notes";
import type { Question, QuestionNote } from "@/types/types";

type NotesSnapshot = {
  notes: ReadonlyMap<string, QuestionNote>;
  readError: boolean;
  unsaved: ReadonlySet<string>;
};

const emptySnapshot: NotesSnapshot = {
  notes: new Map(),
  readError: false,
  unsaved: new Set(),
};

// This store is initialized in the browser; SSR always uses emptySnapshot.
let snapshot = emptySnapshot;
let initialized = false;
const listeners = new Set<() => void>();

function readNotes(): NotesSnapshot {
  const notes = new Map<string, QuestionNote>();
  let readError = false;

  try {
    const storage = window.localStorage;

    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);

      if (!key?.startsWith(QUESTION_NOTE_KEY_PREFIX)) {
        continue;
      }

      try {
        const value: unknown = JSON.parse(storage.getItem(key) ?? "null");

        if (!isQuestionNote(value) || questionNoteKey(value.question_number) !== key) {
          readError = true;
          continue;
        }

        notes.set(value.question_number, value);
      } catch {
        readError = true;
      }
    }
  } catch {
    readError = true;
  }

  return { notes, readError, unsaved: new Set() };
}

function getSnapshot() {
  if (!initialized) {
    snapshot = readNotes();
    initialized = true;
  }

  return snapshot;
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== null && !event.key.startsWith(QUESTION_NOTE_KEY_PREFIX)) {
    return;
  }

  const loaded = readNotes();
  const notes = new Map(loaded.notes);

  if (loaded.readError) {
    for (const [number, note] of snapshot.notes) {
      const wasDeleted = event.key === questionNoteKey(number) && event.newValue === null;

      if (!notes.has(number) && !wasDeleted) {
        notes.set(number, note);
      }
    }
  }

  // External changes must not replace edits that failed to save in this tab.
  for (const number of snapshot.unsaved) {
    const note = snapshot.notes.get(number);

    if (note) {
      notes.set(number, note);
    } else {
      notes.delete(number);
    }
  }

  snapshot = { ...loaded, notes, unsaved: snapshot.unsaved };
  notifyListeners();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("storage", handleStorageChange);
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorageChange);
    }
  };
}

function saveNote(question: Question, text: string) {
  const current = getSnapshot();
  const notes = new Map(current.notes);
  const unsaved = new Set(current.unsaved);
  const note = {
    question_number: question.question_number,
    name: question.name,
    url: question.url,
    text,
  } satisfies QuestionNote;

  if (text === "") {
    notes.delete(question.question_number);
  } else {
    notes.set(question.question_number, note);
  }

  try {
    if (text === "") {
      window.localStorage.removeItem(questionNoteKey(question.question_number));
    } else {
      window.localStorage.setItem(
        questionNoteKey(question.question_number),
        JSON.stringify(note),
      );
    }

    unsaved.delete(question.question_number);
  } catch {
    unsaved.add(question.question_number);
  }

  snapshot = { ...current, notes, unsaved };
  notifyListeners();
}

function exportNotes(questions: Question[]) {
  const text = formatQuestionNotes(getSnapshot().notes.values(), questions);

  if (!text) {
    return;
  }

  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "your-leetcode-notes.txt";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getServerSnapshot() {
  return emptySnapshot;
}

export function useQuestionNotes() {
  const { notes, readError, unsaved } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    exportNotes,
    hasNotes: Array.from(notes.values()).some((note) => note.text.trim().length > 0),
    notes,
    notesError: unsaved.size > 0
      ? "Some notes could not be saved in this browser. Export them to keep a copy."
      : readError
        ? "Some saved notes could not be read. Existing stored data has been kept."
        : "",
    saveNote,
  };
}
