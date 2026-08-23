'use client';

import { useEffect, useState, type ComponentType } from 'react';
import type { BeamsProps } from './Beams';

export default function ClientBeams(props: BeamsProps) {
  const [BeamsComponent, setBeamsComponent] =
    useState<ComponentType<BeamsProps> | null>(null);

  useEffect(() => {
    let isMounted = true;

    void import('./Beams').then((module) => {
      if (isMounted) setBeamsComponent(() => module.default);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return BeamsComponent ? <BeamsComponent {...props} /> : null;
}
