"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { PointerEvent } from "react";
import { useMotionValue } from "motion/react";

const DEFAULT_WIDTH = 600;
const MIN_WIDTH = 320;

type ResizeDrag = {
  handle: HTMLDivElement;
  pointerId: number;
  startX: number;
  startWidth: number;
  nextWidth: number;
  previousCursor: string;
  previousUserSelect: string;
};

type SidebarWidthOptions = {
  canResize: boolean;
  isOpen: boolean;
};

export function useSidebarWidth({ canResize, isOpen }: SidebarWidthOptions) {
  const width = useMotionValue(DEFAULT_WIDTH);
  const dragRef = useRef<ResizeDrag | null>(null);
  const ignoreClickRef = useRef(false);
  const clickFrameRef = useRef<number | null>(null);
  const resizeFrameRef = useRef<number | null>(null);

  const applyWidth = useCallback(() => {
    resizeFrameRef.current = null;
    const nextWidth = Math.min(dragRef.current?.nextWidth ?? width.get(), window.innerWidth);
    if (width.get() !== nextWidth) width.set(nextWidth);
  }, [width]);

  const scheduleWidth = useCallback(() => {
    if (resizeFrameRef.current === null) {
      resizeFrameRef.current = window.requestAnimationFrame(applyWidth);
    }
  }, [applyWidth]);

  const endResize = useCallback(() => {
    const drag = dragRef.current;

    if (!drag) {
      return;
    }

    if (resizeFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeFrameRef.current);
      applyWidth();
    }

    dragRef.current = null;
    document.documentElement.style.cursor = drag.previousCursor;
    document.documentElement.style.userSelect = drag.previousUserSelect;
    delete drag.handle.dataset.resizing;

    if (drag.handle.hasPointerCapture(drag.pointerId)) {
      drag.handle.releasePointerCapture(drag.pointerId);
    }

    ignoreClickRef.current = true;
    clickFrameRef.current = window.requestAnimationFrame(() => {
      ignoreClickRef.current = false;
      clickFrameRef.current = null;
    });
  }, [applyWidth]);

  const clearResizeState = useCallback(() => {
    endResize();
    if (clickFrameRef.current !== null) {
      window.cancelAnimationFrame(clickFrameRef.current);
      clickFrameRef.current = null;
    }
    if (resizeFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeFrameRef.current);
      resizeFrameRef.current = null;
    }
    ignoreClickRef.current = false;
  }, [endResize]);

  useLayoutEffect(() => {
    if (!isOpen) {
      clearResizeState();
      width.set(DEFAULT_WIDTH);
    }
  }, [isOpen, clearResizeState, width]);

  useEffect(() => {
    if (!isOpen) return clearResizeState;

    function updateViewportWidth() {
      endResize();
      scheduleWidth();
    }

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);

    return () => {
      window.removeEventListener("resize", updateViewportWidth);
      clearResizeState();
    };
  }, [isOpen, endResize, scheduleWidth, clearResizeState]);

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
      nextWidth: width.get(),
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
    drag.nextWidth = nextWidth;
    scheduleWidth();
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
