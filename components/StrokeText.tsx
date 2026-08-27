'use client';

import { useId, type CSSProperties } from 'react';
import './StrokeText.css';

export interface StrokeTextProps {
  text: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  drawDuration?: number;
  fillDelay?: number;
  stagger?: number;
  ease?: string;
  trigger?: 'mount';
  fillMode?: 'wipe' | 'fade';
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  className?: string;
}

const cssEase = (ease: string) => {
  if (ease === 'power2.out') return 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  return ease;
};

export default function StrokeText({
  text,
  strokeColor = '#ffffff',
  fillColor = '#F8FAFC',
  strokeWidth = 1.4,
  drawDuration = 0.8,
  fillDelay = 0.2,
  stagger = 0.05,
  ease = 'power2.out',
  trigger = 'mount',
  fillMode = 'wipe',
  fontSize = 128,
  fontWeight = 800,
  letterSpacing = -4,
  className = '',
}: StrokeTextProps) {
  const id = useId().replace(/:/g, '');
  const designSize = Math.max(fontSize, 1);
  const viewBoxHeight = designSize * 1.16;
  const characters = Array.from(text);
  const safeDrawDuration = Math.max(drawDuration, 0);
  const safeFillDelay = Math.max(fillDelay, 0);
  const safeStagger = Math.max(stagger, 0);
  const style = {
    '--stroke-color': strokeColor,
    '--stroke-fill-color': fillColor,
    '--stroke-width': strokeWidth,
    '--stroke-font-size': `${designSize}px`,
    '--stroke-font-weight': fontWeight,
    '--stroke-draw-duration': `${safeDrawDuration}s`,
    '--stroke-ease': cssEase(ease),
  } as CSSProperties;

  return (
    <span
      className={`stroke-text ${className}`.trim()}
      data-fill-mode={fillMode}
      data-trigger={trigger}
      style={style}
    >
      <span className="stroke-text__accessible">{text}</span>
      {characters.map((character, index) => {
        const characterStyle = {
          '--stroke-draw-delay': `${index * safeStagger}s`,
          '--stroke-fill-start': `${
            index * safeStagger + safeDrawDuration + safeFillDelay
          }s`,
          marginInlineEnd: index === characters.length - 1 ? 0 : letterSpacing,
        } as CSSProperties;

        if (character === ' ') {
          return (
            <span
              className="stroke-text__space"
              style={characterStyle}
              aria-hidden="true"
              key={`${id}-space-${index}`}
            />
          );
        }

        const clipId = `${id}-fill-${index}`;

        return (
          <span
            className="stroke-text__glyph"
            style={characterStyle}
            aria-hidden="true"
            key={`${id}-${character}-${index}`}
          >
            <svg
              viewBox={`0 0 ${designSize} ${viewBoxHeight}`}
              role="presentation"
              focusable="false"
            >
              <defs>
                <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                  <rect
                    className="stroke-text__wipe"
                    x="0"
                    y="0"
                    width={designSize}
                    height={viewBoxHeight}
                  />
                </clipPath>
              </defs>
              <text
                className="stroke-text__outline"
                x={designSize / 2}
                y={viewBoxHeight / 2}
                dominantBaseline="central"
                textAnchor="middle"
                fontFamily="inherit"
                fontSize={designSize}
                fontWeight={fontWeight}
              >
                {character}
              </text>
              <text
                className="stroke-text__fill"
                x={designSize / 2}
                y={viewBoxHeight / 2}
                dominantBaseline="central"
                textAnchor="middle"
                fontFamily="inherit"
                fontSize={designSize}
                fontWeight={fontWeight}
                clipPath={fillMode === 'wipe' ? `url(#${clipId})` : undefined}
              >
                {character}
              </text>
            </svg>
          </span>
        );
      })}
    </span>
  );
}
