"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type HTMLAttributes, type ReactNode, useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

interface FadeContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  blur?: boolean;
  duration?: number;
  ease?: string;
  delay?: number;
  threshold?: number;
  initialOpacity?: number;
  isVisible?: boolean;
}

export default function FadeContent({
  children,
  blur = false,
  duration = 1000,
  ease = "power2.out",
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  isVisible = true,
  ...props
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const getSeconds = (value: number) => (value > 10 ? value / 1000 : value);
    let timeline: gsap.core.Timeline | undefined;
    let scrollTrigger: ScrollTrigger | undefined;

    if (isVisible) {
      timeline = gsap.timeline({ paused: true, delay: getSeconds(delay) });

      gsap.set(element, {
        autoAlpha: initialOpacity,
        filter: blur ? "blur(10px)" : "blur(0px)",
        willChange: "opacity, filter",
      });

      timeline.to(element, {
        autoAlpha: 1,
        duration: getSeconds(duration),
        ease,
        filter: "blur(0px)",
      });

      scrollTrigger = ScrollTrigger.create({
        trigger: element,
        start: `top ${(1 - threshold) * 100}%`,
        once: true,
        onEnter: () => timeline?.play(),
      });
    } else {
      gsap.to(element, {
        autoAlpha: initialOpacity,
        duration: getSeconds(duration),
        ease,
        filter: blur ? "blur(10px)" : "blur(0px)",
      });
    }

    return () => {
      scrollTrigger?.kill();
      timeline?.kill();
      gsap.killTweensOf(element);
    };
  }, [blur, delay, duration, ease, initialOpacity, isVisible, threshold]);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
}
