"use client";

import {
  formatQuestionNotes,
  isQuestionNote,
  QUESTION_NOTE_KEY_PREFIX,
  questionNoteKey,
} from "@/lib/question-notes";
import type { Question, QuestionNote } from "@/types/types";

type NotesStatus = { hasNotes: boolean; notesError: string };
type Listener = () => void;

export const EMPTY_NOTES_STATUS: NotesStatus = { hasNotes: false, notesError: "" };

const notes = new Map<string, QuestionNote>();
const dirty = new Set<string>();
const failed = new Set<string>();
const invalidKeys = new Set<string>();
const noteListeners = new Map<string, Set<Listener>>();
const statusListeners = new Set<Listener>();
let initialized = false;
let readUnavailable = false;
let exportableCount = 0;
let status = EMPTY_NOTES_STATUS;
let subscribers = 0;
let pauseTimer: number | null = null;
let maximumTimer: number | null = null;

function replaceNote(number: string, note: QuestionNote | undefined) {
  if (notes.get(number)?.text.trim()) exportableCount--;
  if (note?.text.trim()) exportableCount++;
  if (note) notes.set(number, note);
  else notes.delete(number);
}

function notifyNote(number: string) {
  noteListeners.get(number)?.forEach((listener) => listener());
}

function updateStatus() {
  const hasNotes = exportableCount > 0;
  const notesError = failed.size > 0
    ? "Some notes could not be saved in this browser. Export them to keep a copy."
    : readUnavailable || invalidKeys.size > 0
      ? "Some saved notes could not be read. Existing stored data has been kept."
      : "";

  if (hasNotes !== status.hasNotes || notesError !== status.notesError) {
    status = { hasNotes, notesError };
    statusListeners.forEach((listener) => listener());
  }
}

function loadNote(key: string, raw: string | null) {
  try {
    const number = decodeURIComponent(key.slice(QUESTION_NOTE_KEY_PREFIX.length));
    if (!number || questionNoteKey(number) !== key) throw new Error("Invalid note key");

    if (dirty.has(number)) return;
    const previousText = notes.get(number)?.text ?? "";
    if (raw === null) {
      replaceNote(number, undefined);
    } else {
      const value: unknown = JSON.parse(raw);
      if (!isQuestionNote(value) || questionNoteKey(value.question_number) !== key) throw new Error("Invalid note");
      replaceNote(number, value);
    }
    invalidKeys.delete(key);
    if (previousText !== (notes.get(number)?.text ?? "")) notifyNote(number);
  } catch {
    invalidKeys.add(key);
  }
}

function initialize() {
  if (initialized) return;
  initialized = true;
  try {
    const storage = window.localStorage;
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (key?.startsWith(QUESTION_NOTE_KEY_PREFIX)) loadNote(key, storage.getItem(key));
    }
  } catch {
    readUnavailable = true;
  }
  updateStatus();
}

export function getQuestionNote(number: string) {
  initialize();
  return notes.get(number)?.text ?? "";
}

export function getNotesStatus() {
  initialize();
  return status;
}

function cancelSaveTimers() {
  if (pauseTimer !== null) window.clearTimeout(pauseTimer);
  if (maximumTimer !== null) window.clearTimeout(maximumTimer);
  pauseTimer = null;
  maximumTimer = null;
}

export function flushQuestionNotes() {
  cancelSaveTimers();
  for (const number of dirty) {
    const key = questionNoteKey(number);
    const note = notes.get(number);
    try {
      if (note) window.localStorage.setItem(key, JSON.stringify(note));
      else window.localStorage.removeItem(key);
      dirty.delete(number);
      failed.delete(number);
      invalidKeys.delete(key);
    } catch {
      failed.add(number);
    }
  }
  updateStatus();
}

export function updateQuestionNote(question: Question, text: string) {
  initialize();
  const number = question.question_number;
  if ((notes.get(number)?.text ?? "") === text) return;
  replaceNote(number, text === "" ? undefined : {
    question_number: number,
    name: question.name,
    url: question.url,
    text,
  });
  dirty.add(number);
  notifyNote(number);
  updateStatus();
  if (pauseTimer !== null) window.clearTimeout(pauseTimer);
  pauseTimer = window.setTimeout(flushQuestionNotes, 250);
  if (maximumTimer === null) maximumTimer = window.setTimeout(flushQuestionNotes, 1000);
}

function handleStorageChange(event: StorageEvent) {
  if (event.storageArea !== null && event.storageArea !== window.localStorage) return;
  if (event.key === null) {
    for (const number of notes.keys()) {
      if (!dirty.has(number)) {
        replaceNote(number, undefined);
        notifyNote(number);
      }
    }
    invalidKeys.clear();
    readUnavailable = false;
  } else if (event.key.startsWith(QUESTION_NOTE_KEY_PREFIX)) {
    loadNote(event.key, event.newValue);
  } else {
    return;
  }
  updateStatus();
}

function handleVisibilityChange() {
  if (document.visibilityState === "hidden") flushQuestionNotes();
}

function retainStore() {
  if (subscribers++ === 0) {
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("pagehide", flushQuestionNotes);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }
  return () => {
    if (--subscribers === 0) {
      flushQuestionNotes();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("pagehide", flushQuestionNotes);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };
}

export function subscribeQuestionNote(number: string, listener: Listener) {
  const listeners = noteListeners.get(number) ?? new Set<Listener>();
  noteListeners.set(number, listeners);
  listeners.add(listener);
  const release = retainStore();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) noteListeners.delete(number);
    release();
  };
}

export function subscribeNotesStatus(listener: Listener) {
  statusListeners.add(listener);
  const release = retainStore();
  return () => {
    statusListeners.delete(listener);
    release();
  };
}

export function exportQuestionNotes(questions: Question[]) {
  initialize();
  flushQuestionNotes();
  const text = formatQuestionNotes(notes.values(), questions);
  if (!text) return;
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "your-leetcode-notes.txt";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
