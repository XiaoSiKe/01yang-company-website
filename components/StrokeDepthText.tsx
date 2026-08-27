import type { CSSProperties } from 'react';
import DepthText from './DepthText';
import StrokeText from './StrokeText';
import './StrokeDepthText.css';

export interface StrokeDepthTextProps {
  text: string;
  letterSpacing: number;
  className?: string;
}

const drawDuration = 0.8;
const fillDelay = 0.2;
const stagger = 0.05;

export default function StrokeDepthText({
  text,
  letterSpacing,
  className = '',
}: StrokeDepthTextProps) {
  const lastCharacterDelay = Math.max(Array.from(text).length - 1, 0) * stagger;
  const transitionDelay = lastCharacterDelay + drawDuration + fillDelay + drawDuration;
  const style = {
    '--stroke-depth-transition-delay': `${transitionDelay}s`,
    '--depth-letter-spacing': `${letterSpacing}px`,
  } as CSSProperties;

  return (
    <span className={`stroke-depth-text ${className}`.trim()} style={style}>
      <span className="stroke-depth-text__accessible">{text}</span>
      <span className="stroke-depth-text__stroke" aria-hidden="true">
        <StrokeText
          text={text}
          strokeColor="#ffffff"
          fillColor="#ffffff"
          strokeWidth={1.4}
          drawDuration={drawDuration}
          fillDelay={fillDelay}
          stagger={stagger}
          ease="power2.out"
          trigger="mount"
          fillMode="wipe"
          fontSize={128}
          fontWeight={800}
          letterSpacing={letterSpacing}
        />
      </span>
      <span className="stroke-depth-text__depth" aria-hidden="true">
        <DepthText
          text={text}
          layers={34}
          depth={2.4}
          faceColor="#ffffff"
          depthColor="#373737"
          tilt={7.5}
          pointerTracking
          smoothing={0.14}
          perspective={900}
          autoOrbit
          orbitSpeed={0.35}
          fontSize="clamp(3rem, 12vw, 7rem)"
          fontWeight={900}
          shadow
        />
      </span>
    </span>
  );
}
