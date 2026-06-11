import { type CSSProperties } from "react";

import styles from "./ShinyText.module.css";

type ShinyTextProps = {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
};

export default function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className = "",
}: ShinyTextProps) {
  return (
    <span
      className={`${styles.shinyText} ${disabled ? styles.disabled : ""} ${className}`}
      style={{ "--shiny-text-speed": `${speed}s` } as CSSProperties}
    >
      {text}
    </span>
  );
}
