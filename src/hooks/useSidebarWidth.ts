"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent } from "react";
import { useMotionValue } from "motion/react";

const WIDTH_KEY = "lc-question-randomizer.sidebar-width.v1";
const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 320;

type ResizeDrag = {
  handle: HTMLDivElement;
  pointerId: number;
  startX: number;
  startWidth: number;
  previousCursor: string;
  previousUserSelect: string;
};

export function useSidebarWidth(canResize: boolean) {
  const width = useMotionValue(DEFAULT_WIDTH);
  const preferredWidthRef = useRef(DEFAULT_WIDTH);
  const dragRef = useRef<ResizeDrag | null>(null);
  const ignoreClickRef = useRef(false);
  const clickFrameRef = useRef<number | null>(null);

  const endResize = useCallback(() => {
    const drag = dragRef.current;

    if (!drag) {
      return;
    }

    dragRef.current = null;
    document.documentElement.style.cursor = drag.previousCursor;
    document.documentElement.style.userSelect = drag.previousUserSelect;
    delete drag.handle.dataset.resizing;

    if (drag.handle.hasPointerCapture(drag.pointerId)) {
      drag.handle.releasePointerCapture(drag.pointerId);
    }

    try {
      window.localStorage.setItem(WIDTH_KEY, JSON.stringify(preferredWidthRef.current));
    } catch {
      // Width is a nonessential preference; resizing still works without storage.
    }

    // A pointer release outside the panel must not become a backdrop click.
    ignoreClickRef.current = true;
    clickFrameRef.current = window.requestAnimationFrame(() => {
      ignoreClickRef.current = false;
      clickFrameRef.current = null;
    });
  }, []);

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(window.localStorage.getItem(WIDTH_KEY) ?? "null");

      if (typeof saved === "number" && Number.isFinite(saved) && saved >= MIN_WIDTH) {
        preferredWidthRef.current = saved;
      }
    } catch {
      // Keep the default width when this preference is unavailable or invalid.
    }

    function updateViewportWidth() {
      endResize();
      width.set(Math.min(preferredWidthRef.current, window.innerWidth));
    }

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);

    return () => {
      window.removeEventListener("resize", updateViewportWidth);
      endResize();

      if (clickFrameRef.current !== null) {
        window.cancelAnimationFrame(clickFrameRef.current);
      }
    };
  }, [endResize, width]);

  useEffect(() => {
    if (!canResize) {
      endResize();
    }
  }, [canResize, endResize]);

  function startResize(event: PointerEvent<HTMLDivElement>) {
    if (!canResize || event.button !== 0 || dragRef.current) {
      return;
    }

    event.preventDefault();

    if (clickFrameRef.current !== null) {
      window.cancelAnimationFrame(clickFrameRef.current);
      clickFrameRef.current = null;
    }

    const root = document.documentElement;
    dragRef.current = {
      handle: event.currentTarget,
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: width.get(),
      previousCursor: root.style.cursor,
      previousUserSelect: root.style.userSelect,
    };
    ignoreClickRef.current = true;
    root.style.cursor = "col-resize";
    root.style.userSelect = "none";
    event.currentTarget.dataset.resizing = "true";
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveResize(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const nextWidth = Math.min(
      window.innerWidth,
      Math.max(MIN_WIDTH, drag.startWidth + event.clientX - drag.startX),
    );
    preferredWidthRef.current = nextWidth;
    width.set(nextWidth);
  }

  function shouldIgnoreBackdropClick() {
    return ignoreClickRef.current;
  }

  return {
    endResize,
    moveResize,
    shouldIgnoreBackdropClick,
    startResize,
    width,
  };
}
