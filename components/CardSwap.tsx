'use client';

import { gsap } from 'gsap';
import {
  Children,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactElement,
} from 'react';
import './CardSwap.css';

export type CardProps = ComponentPropsWithoutRef<'article'>;

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { className = '', ...props },
  ref,
) {
  return <article ref={ref} className={`card-swap__card ${className}`.trim()} {...props} />;
});

Card.displayName = 'Card';

export interface CardSwapProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: ReactElement<CardProps> | ReactElement<CardProps>[];
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  paused?: boolean;
}

interface StackGeometry {
  horizontalDistance: number;
  verticalDistance: number;
}

export default function CardSwap({
  children,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  paused = false,
  className = '',
  ...props
}: CardSwapProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const pauseControllerRef = useRef({
    pause: () => {},
    resume: () => {},
  });
  const childCount = Children.count(children);

  useEffect(() => {
    pausedRef.current = paused;

    if (paused) {
      pauseControllerRef.current.pause();
    } else {
      pauseControllerRef.current.resume();
    }
  }, [paused]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(root.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.classList.contains('card-swap__card'),
    );
    if (cards.length === 0) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduceMotion = motionPreference.matches;
    let hoverPaused = false;
    let timer: number | undefined;
    let resizeFrame = 0;
    let timeline: gsap.core.Timeline | undefined;
    let order = cards.map((_, index) => index);

    const clearTimer = () => {
      if (timer === undefined) return;
      window.clearTimeout(timer);
      timer = undefined;
    };

    const killTimeline = () => {
      timeline?.kill();
      timeline = undefined;
    };

    const measure = (): StackGeometry => {
      const card = cards[0];
      const slots = Math.max(cards.length - 1, 1);
      const availableWidth = Math.max(root.clientWidth - card.offsetWidth, 0);
      const availableHeight = Math.max(root.clientHeight - card.offsetHeight, 0);

      return {
        horizontalDistance: Math.min(Math.max(cardDistance, 0), availableWidth / slots),
        verticalDistance: Math.min(Math.max(verticalDistance, 0), availableHeight / slots),
      };
    };

    const targetFor = (cardIndex: number, geometry: StackGeometry) => {
      const slot = order.indexOf(cardIndex);

      return {
        x: slot * geometry.horizontalDistance,
        y: -slot * geometry.verticalDistance,
        z: -slot * 18,
        zIndex: cards.length - slot,
      };
    };

    const placeCards = () => {
      const geometry = measure();

      cards.forEach((card, index) => {
        gsap.set(card, {
          ...targetFor(index, geometry),
          force3D: true,
        });
      });
    };

    const scheduleNext = () => {
      clearTimer();
      if (reduceMotion || pausedRef.current || hoverPaused || cards.length < 2) return;

      timer = window.setTimeout(swapCards, Math.max(delay, 0));
    };

    const swapCards = () => {
      timer = undefined;
      if (reduceMotion || pausedRef.current || hoverPaused || cards.length < 2) return;

      const [front, ...remaining] = order;
      order = [...remaining, front];
      const geometry = measure();

      cards.forEach((card, index) => {
        const target = targetFor(index, geometry);
        gsap.set(card, { zIndex: target.zIndex });
      });

      timeline = gsap.timeline({
        defaults: { duration: 0.9, ease: 'power3.inOut' },
        onComplete: () => {
          timeline = undefined;
          scheduleNext();
        },
      });

      cards.forEach((card, index) => {
        const target = targetFor(index, geometry);
        timeline?.to(
          card,
          { x: target.x, y: target.y, z: target.z, force3D: true },
          0,
        );
      });
    };

    const syncMotionPreference = () => {
      reduceMotion = motionPreference.matches;
      clearTimer();
      killTimeline();

      if (reduceMotion) {
        gsap.set(cards, { clearProps: 'transform,zIndex' });
        return;
      }

      placeCards();
      scheduleNext();
    };

    const onPointerEnter = () => {
      hoverPaused = true;
      clearTimer();
    };

    const onPointerLeave = () => {
      hoverPaused = false;
      if (!timeline) scheduleNext();
    };

    pauseControllerRef.current = {
      pause: () => {
        clearTimer();
        timeline?.pause();
      },
      resume: () => {
        if (reduceMotion) return;

        if (timeline) {
          timeline.resume();
        } else {
          scheduleNext();
        }
      },
    };

    const resizeObserver = new ResizeObserver(() => {
      if (reduceMotion) return;
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        killTimeline();
        placeCards();
        scheduleNext();
      });
    });

    resizeObserver.observe(root);
    cards.forEach((card) => resizeObserver.observe(card));
    motionPreference.addEventListener('change', syncMotionPreference);

    if (pauseOnHover) {
      root.addEventListener('pointerenter', onPointerEnter);
      root.addEventListener('pointerleave', onPointerLeave);
    }

    syncMotionPreference();

    return () => {
      clearTimer();
      killTimeline();
      window.cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
      motionPreference.removeEventListener('change', syncMotionPreference);
      root.removeEventListener('pointerenter', onPointerEnter);
      root.removeEventListener('pointerleave', onPointerLeave);
      pauseControllerRef.current = { pause: () => {}, resume: () => {} };
      gsap.set(cards, { clearProps: 'transform,zIndex' });
    };
  }, [cardDistance, childCount, delay, pauseOnHover, verticalDistance]);

  return (
    <div ref={rootRef} className={`card-swap ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
