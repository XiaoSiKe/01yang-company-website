'use client';

import { useState, type CSSProperties } from 'react';
import './AccordionGallery.css';

export type AccordionGalleryItem = {
  image: string;
  label: string;
  link?: string;
};

type AccordionGalleryProps = {
  items: readonly AccordionGalleryItem[];
  defaultIndex?: number;
  expandRatio?: number;
  trigger?: 'hover' | 'click';
  ariaLabel?: string;
  className?: string;
};

function clampIndex(index: number, itemCount: number) {
  if (itemCount === 0) return 0;
  return Math.min(Math.max(index, 0), itemCount - 1);
}

export default function AccordionGallery({
  items,
  defaultIndex = 0,
  expandRatio = 0.52,
  trigger = 'hover',
  ariaLabel = '项目展示',
  className = '',
}: AccordionGalleryProps) {
  const initialIndex = clampIndex(defaultIndex, items.length);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const ratio = Math.min(Math.max(expandRatio, 0.3), 0.8);
  const collapsedPanels = Math.max(items.length - 1, 1);
  const activeGrow = items.length > 1 ? (ratio * collapsedPanels) / (1 - ratio) : 1;
  const style = { '--accordion-active-grow': activeGrow } as CSSProperties;

  if (items.length === 0) return null;

  return (
    <div
      className={`accordion-gallery ${className}`.trim()}
      style={style}
      role="list"
      aria-label={ariaLabel}
      onMouseLeave={() => {
        if (trigger === 'hover') setActiveIndex(initialIndex);
      }}
    >
      {items.map((item, index) => {
        const isActive = activeIndex === index;
        const content = (
          <>
            {/* Placeholder images are kept locally until real project imagery is supplied. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="accordion-gallery__image"
              src={item.image}
              alt=""
              width={900}
              height={1200}
              loading="lazy"
              decoding="async"
            />
            <span className="accordion-gallery__scrim" aria-hidden="true" />
            <span className="accordion-gallery__caption">
              <span className="accordion-gallery__number">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="accordion-gallery__label">{item.label}</span>
            </span>
          </>
        );

        return (
          <div
            className="accordion-gallery__panel"
            data-active={isActive}
            role="listitem"
            key={`${item.image}-${item.label}`}
            onMouseEnter={() => {
              if (trigger === 'hover') setActiveIndex(index);
            }}
            onFocusCapture={() => setActiveIndex(index)}
            onPointerDown={(event) => {
              if (event.pointerType !== 'mouse') setActiveIndex(index);
            }}
          >
            {item.link ? (
              <a
                className="accordion-gallery__surface"
                href={item.link}
                onClick={() => {
                  if (trigger === 'click') setActiveIndex(index);
                }}
              >
                {content}
              </a>
            ) : (
              <button
                className="accordion-gallery__surface"
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveIndex(index)}
              >
                {content}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
