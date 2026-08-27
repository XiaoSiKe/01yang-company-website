'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import './DepthText.css';

export interface DepthTextProps {
  text: string;
  layers?: number;
  depth?: number;
  faceColor?: string;
  depthColor?: string;
  tilt?: number;
  pointerTracking?: boolean;
  smoothing?: number;
  perspective?: number;
  autoOrbit?: boolean;
  orbitSpeed?: number;
  fontSize?: string;
  fontWeight?: number;
  shadow?: boolean;
  className?: string;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

export default function DepthText({
  text,
  layers = 34,
  depth = 2.4,
  faceColor = '#f8fafc',
  depthColor = '#000000',
  tilt = 7.5,
  pointerTracking = true,
  smoothing = 0.14,
  perspective = 900,
  autoOrbit = true,
  orbitSpeed = 0.35,
  fontSize = 'clamp(3rem, 12vw, 7rem)',
  fontWeight = 900,
  shadow = true,
  className = '',
}: DepthTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<HTMLSpanElement>(null);
  const layerCount = Math.max(1, Math.floor(layers));
  const style = {
    '--depth-face-color': faceColor,
    '--depth-layer-color': depthColor,
    '--depth-font-size': fontSize,
    '--depth-font-weight': fontWeight,
    '--depth-perspective': `${perspective}px`,
  } as CSSProperties;

  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    if (!root || !scene) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const smoothingAmount = clamp(smoothing, 0.01, 1);
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let isVisible = true;
    const startedAt = performance.now();

    const onPointerMove = (event: PointerEvent) => {
      pointerX = clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      pointerY = clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1);
    };

    const render = (time: number) => {
      const elapsed = (time - startedAt) / 1000;
      const orbit = elapsed * orbitSpeed;
      const orbitX = autoOrbit ? Math.cos(orbit) * tilt * 0.34 : 0;
      const orbitY = autoOrbit ? Math.sin(orbit) * tilt : 0;
      const pointerTiltX = pointerTracking ? -pointerY * tilt * 0.65 : 0;
      const pointerTiltY = pointerTracking ? pointerX * tilt : 0;
      const maximumTilt = Math.abs(tilt) * 1.5;
      const targetX = clamp(orbitX + pointerTiltX, -maximumTilt, maximumTilt);
      const targetY = clamp(orbitY + pointerTiltY, -maximumTilt, maximumTilt);

      currentX += (targetX - currentX) * smoothingAmount;
      currentY += (targetY - currentY) * smoothingAmount;
      scene.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg)`;
      frame = window.requestAnimationFrame(render);
    };

    const syncMotion = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;

      if (motionPreference.matches || !isVisible) {
        scene.style.transform = 'none';
        return;
      }

      if (!autoOrbit && !pointerTracking) {
        scene.style.transform = `rotateX(${-tilt * 0.2}deg) rotateY(${tilt * 0.45}deg)`;
        return;
      }

      frame = window.requestAnimationFrame(render);
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
        syncMotion();
      },
      { rootMargin: '120px 0px' },
    );

    if (pointerTracking) window.addEventListener('pointermove', onPointerMove, { passive: true });
    motionPreference.addEventListener('change', syncMotion);
    visibilityObserver.observe(root);
    syncMotion();

    return () => {
      if (pointerTracking) window.removeEventListener('pointermove', onPointerMove);
      motionPreference.removeEventListener('change', syncMotion);
      visibilityObserver.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [autoOrbit, orbitSpeed, pointerTracking, smoothing, tilt]);

  return (
    <span
      className={`depth-text ${className}`.trim()}
      data-shadow={shadow}
      style={style}
      ref={rootRef}
    >
      <span className="depth-text__accessible">{text}</span>
      <span className="depth-text__scene" ref={sceneRef} aria-hidden="true">
        <span className="depth-text__stack">
          {Array.from({ length: layerCount }, (_, index) => {
            const layer = layerCount - index;
            const depthProgress = layerCount === 1 ? 1 : index / (layerCount - 1);
            const opacity = 0.12 + depthProgress * 0.8;

            return (
              <span
                className="depth-text__layer"
                style={{
                  opacity,
                  transform: `translateZ(${-layer * depth}px)`,
                }}
                key={layer}
              >
                {text}
              </span>
            );
          })}
          <span className="depth-text__face">{text}</span>
        </span>
      </span>
    </span>
  );
}
