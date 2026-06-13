"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type ScrollRevealProps = {
  children: (isVisible: boolean) => ReactNode;
  className?: string;
};

export default function ScrollReveal({
  children,
  className,
}: ScrollRevealProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={className} ref={sectionRef}>
      {children(isVisible)}
    </div>
  );
}
