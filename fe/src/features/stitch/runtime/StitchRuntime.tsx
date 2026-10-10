'use client';

import { useEffect } from 'react';
import { stitchBehaviors, type StitchBehaviorScreen } from '../behaviors/registry.generated';
import { mountStitchBehavior } from './mountStitchBehavior';

interface StitchRuntimeProps {
  screen: StitchBehaviorScreen;
}

/**
 * Client island that brings a server-rendered Stitch screen to life.
 * It renders nothing; it loads the screen's behavior chunk and mounts it on `[data-stitch]`.
 */
export function StitchRuntime({ screen }: StitchRuntimeProps) {
  useEffect(() => {
    let active = true;
    let teardown: (() => void) | undefined;

    // Deferred one task so React Strict Mode's mount → unmount → mount in development
    // cancels the first run instead of starting the scripts twice.
    const timer = window.setTimeout(async () => {
      const root = document.querySelector<HTMLElement>(`[data-stitch="${screen}"]`);
      if (!root) return;
      const { default: behavior } = await stitchBehaviors[screen]();
      if (active) teardown = mountStitchBehavior(root, behavior, screen);
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
      teardown?.();
    };
  }, [screen]);

  return null;
}
