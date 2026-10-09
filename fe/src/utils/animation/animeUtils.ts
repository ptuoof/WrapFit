import { animate, stagger } from "animejs";

/**
 * Animate a numeric value from start to end with Anime.js
 * Ideal for CAD dimensions tickers (L, W, H mm) and FitCheck score (0 -> 100)
 */
export function animateNumberTicker({
  from,
  to,
  duration = 600,
  ease = "outExpo",
  onUpdate,
  onComplete,
}: {
  from: number;
  to: number;
  duration?: number;
  ease?: string;
  onUpdate: (current: number) => void;
  onComplete?: () => void;
}) {
  const holder = { val: from };
  return animate(holder, {
    val: to,
    duration,
    ease,
    onUpdate: () => {
      onUpdate(Math.round(holder.val));
    },
    onComplete: () => {
      if (onComplete) onComplete();
    },
  });
}

/**
 * Animate a floating 3D fold progress slider value smoothly
 */
export function animateFoldProgress({
  from,
  to,
  duration = 750,
  ease = "outCubic",
  onUpdate,
  onComplete,
}: {
  from: number;
  to: number;
  duration?: number;
  ease?: string;
  onUpdate: (current: number) => void;
  onComplete?: () => void;
}) {
  const holder = { val: from };
  return animate(holder, {
    val: to,
    duration,
    ease,
    onUpdate: () => {
      onUpdate(Number(holder.val.toFixed(2)));
    },
    onComplete: () => {
      if (onComplete) onComplete();
    },
  });
}

/**
 * Squishy button click physics:
 * Rapidly squishes down on press, then springs back with slight overshoot
 */
export function triggerSquishyClick(element: HTMLElement | null) {
  if (!element) return;
  animate(element, {
    scale: [
      { to: 0.92, duration: 90, ease: "outQuad" },
      { to: 1.04, duration: 180, ease: "outQuad" },
      { to: 1.0, duration: 150, ease: "outCubic" },
    ],
  });
}

/**
 * Staggered entrance for grid items (Bento cards, box structure list)
 */
export function animateStaggerEntrance(
  targets: HTMLElement[] | NodeListOf<HTMLElement> | string,
  options?: {
    translateY?: number;
    delay?: number;
    staggerDelay?: number;
  }
) {
  const translateY = options?.translateY ?? 24;
  const delay = options?.delay ?? 100;
  const staggerDelay = options?.staggerDelay ?? 60;

  return animate(targets, {
    opacity: [0, 1],
    translateY: [translateY, 0],
    duration: 650,
    delay: stagger(staggerDelay, { start: delay }),
    ease: "outCubic",
  });
}

/**
 * Gentle floating idle animation for mascot badges and 3D preview cards
 */
export function animateFloatingIdle(element: HTMLElement | null) {
  if (!element) return;
  return animate(element, {
    translateY: [-3, 3],
    duration: 2400,
    ease: "inOutSine",
    alternate: true,
    loop: true,
  });
}
