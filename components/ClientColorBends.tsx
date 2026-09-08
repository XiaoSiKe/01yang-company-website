'use client';

import { useEffect, useState, type ComponentType } from 'react';
import type { ColorBendsProps } from './ColorBends';

export default function ClientColorBends(props: ColorBendsProps) {
  const [ColorBendsComponent, setColorBendsComponent] =
    useState<ComponentType<ColorBendsProps> | null>(null);

  useEffect(() => {
    let isMounted = true;

    void import('./ColorBends').then((module) => {
      if (isMounted) setColorBendsComponent(() => module.default);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return ColorBendsComponent ? <ColorBendsComponent {...props} /> : null;
}
