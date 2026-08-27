'use client';

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import './LogoLoop.css';

interface LogoLink {
  href?: string;
  title?: string;
}

export interface NodeLogo extends LogoLink {
  node: ReactNode;
  src?: never;
  alt?: never;
}

export interface ImageLogo extends LogoLink {
  src: string;
  alt: string;
  node?: never;
}

export type LogoLoopItem = NodeLogo | ImageLogo;
export type LogoLoopDirection = 'left' | 'right' | 'up' | 'down';

export interface LogoLoopProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  logos: readonly LogoLoopItem[];
  speed?: number;
  direction?: LogoLoopDirection;
  logoHeight?: number;
  gap?: number;
  hoverSpeed?: number;
  scaleOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  ariaLabel?: string;
}

interface LoopMetrics {
  distance: number;
  duration: number;
  hoverDuration: number;
}

const DEFAULT_METRICS: LoopMetrics = {
  distance: 1,
  duration: 1,
  hoverDuration: 1,
};

function LogoContent({ logo, accessible }: { logo: LogoLoopItem; accessible: boolean }) {
  if ('src' in logo) {
    return (
      // A raw image is intentional here: the component accepts arbitrary local or remote logo sources.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="logo-loop__image"
        src={logo.src}
        alt={accessible ? logo.alt : ''}
        draggable={false}
      />
    );
  }

  return <span className="logo-loop__node">{logo.node}</span>;
}

function LogoItem({
  logo,
  accessible,
  copy,
}: {
  logo: LogoLoopItem;
  accessible: boolean;
  copy: number;
}) {
  const className = 'logo-loop__item';
  const content = <LogoContent logo={logo} accessible={accessible} />;
  const label = 'node' in logo && accessible ? logo.title : undefined;

  if (logo.href) {
    return (
      <a
        className={className}
        href={logo.href}
        title={accessible ? logo.title : undefined}
        aria-label={label}
        aria-hidden={!accessible || undefined}
        tabIndex={accessible ? undefined : -1}
        data-copy={copy}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      className={className}
      title={accessible ? logo.title : undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={!accessible || undefined}
      data-copy={copy}
    >
      {content}
    </span>
  );
}

export default function LogoLoop({
  logos,
  speed = 120,
  direction = 'left',
  logoHeight = 48,
  gap = 40,
  hoverSpeed = 0,
  scaleOnHover = false,
  fadeOut = false,
  fadeOutColor = '#ffffff',
  ariaLabel = 'Logo carousel',
  className = '',
  style: customStyle,
  ...props
}: LogoLoopProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();
  const [repeatCount, setRepeatCount] = useState(1);
  const [metrics, setMetrics] = useState<LoopMetrics>(DEFAULT_METRICS);
  const horizontal = direction === 'left' || direction === 'right';

  useLayoutEffect(() => {
    const root = rootRef.current;
    const group = groupRef.current;
    const measure = measureRef.current;
    if (!root || !group || !measure || logos.length === 0) return;

    let resizeFrame = 0;

    const sizeOnAxis = (element: HTMLElement) =>
      horizontal ? element.scrollWidth : element.scrollHeight;

    const updateMetrics = () => {
      const viewportSize = horizontal ? root.clientWidth : root.clientHeight;
      const unitSize = sizeOnAxis(measure);
      if (viewportSize <= 0 || unitSize <= 0) return;

      const nextRepeatCount = Math.max(1, Math.ceil(viewportSize / unitSize));
      if (nextRepeatCount !== repeatCount) {
        setRepeatCount(nextRepeatCount);
        return;
      }

      const distance = Math.max(sizeOnAxis(group), 1);
      const duration = speed > 0 ? distance / speed : 1;
      const hoverDuration = hoverSpeed > 0 ? distance / hoverSpeed : duration;

      setMetrics((current) => {
        if (
          current.distance === distance &&
          current.duration === duration &&
          current.hoverDuration === hoverDuration
        ) {
          return current;
        }

        return { distance, duration, hoverDuration };
      });
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(updateMetrics);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(root);
    resizeObserver.observe(group);
    resizeObserver.observe(measure);
    updateMetrics();

    return () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
    };
  }, [gap, horizontal, logoHeight, logos.length, repeatCount, speed, hoverSpeed]);

  const renderItems = (duplicate: boolean, copies: number) =>
    Array.from({ length: copies }, (_, copy) =>
      logos.map((logo, index) => (
        <LogoItem
          key={`${instanceId}-${duplicate ? 'clone' : 'source'}-${copy}-${index}`}
          logo={logo}
          accessible={!duplicate && copy === 0}
          copy={copy}
        />
      )),
    );

  const style = {
    ...customStyle,
    '--logo-loop-distance': `${metrics.distance}px`,
    '--logo-loop-duration': `${metrics.duration}s`,
    '--logo-loop-hover-duration': `${metrics.hoverDuration}s`,
    '--logo-loop-height': `${Math.max(logoHeight, 1)}px`,
    '--logo-loop-gap': `${Math.max(gap, 0)}px`,
    '--logo-loop-fade-color': fadeOutColor,
  } as CSSProperties;

  const rootClassName = [
    'logo-loop',
    `logo-loop--${horizontal ? 'horizontal' : 'vertical'}`,
    `logo-loop--${direction}`,
    speed <= 0 && 'logo-loop--static',
    hoverSpeed <= 0 && 'logo-loop--pause-on-interaction',
    hoverSpeed > 0 && 'logo-loop--hover-rate',
    scaleOnHover && 'logo-loop--scale-on-hover',
    fadeOut && 'logo-loop--fade-out',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (logos.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      style={style}
      role="region"
      aria-label={ariaLabel}
      {...props}
    >
      <div className="logo-loop__track">
        <div ref={groupRef} className="logo-loop__group" role="list">
          {renderItems(false, repeatCount)}
        </div>
        <div className="logo-loop__group logo-loop__group--clone" aria-hidden="true">
          {renderItems(true, repeatCount)}
        </div>
      </div>

      <div ref={measureRef} className="logo-loop__measure" aria-hidden="true">
        {renderItems(true, 1)}
      </div>
    </div>
  );
}
