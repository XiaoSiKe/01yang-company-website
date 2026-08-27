import type { CSSProperties } from 'react';
import './ShinyText.css';

export interface ShinyTextProps {
  text: string;
  speed?: number;
  delay?: number;
  color?: string;
  shineColor?: string;
  spread?: number;
  direction?: 'left' | 'right';
  yoyo?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}

export default function ShinyText({
  text,
  speed = 2,
  delay = 0,
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
  direction = 'left',
  yoyo = false,
  pauseOnHover = false,
  className = '',
}: ShinyTextProps) {
  const style = {
    '--shiny-speed': `${Math.max(speed, 0.01)}s`,
    '--shiny-delay': `${Math.max(delay, 0)}s`,
    '--shiny-color': color,
    '--shiny-highlight': shineColor,
    '--shiny-spread': `${Math.max(spread, 100)}%`,
  } as CSSProperties;

  return (
    <span
      className={`shiny-text ${className}`.trim()}
      data-direction={direction}
      data-yoyo={yoyo}
      data-pause-on-hover={pauseOnHover}
      style={style}
    >
      {text}
    </span>
  );
}
