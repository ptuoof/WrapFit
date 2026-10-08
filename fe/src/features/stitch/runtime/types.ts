/**
 * Contracts between the Stitch behavior runtime and the generated behavior modules
 * in `src/features/stitch/behaviors/`.
 *
 * A Stitch screen ships vanilla scripts that expect a browser global scope. The
 * generator wraps each screen's scripts in a `StitchBehavior` that receives a
 * `StitchScope`: drop-in replacements for the globals the scripts touch, which
 * record every listener, timer and WebGL renderer so the runtime can tear the
 * screen down cleanly when the route unmounts.
 */

export type StitchHandler = (this: HTMLElement, event: Event) => unknown;

export interface StitchBehaviorResult {
  /** Inline `on*` attribute bodies, keyed by the id stored in `data-st-on`. */
  handlers?: Record<string, StitchHandler>;
}

export interface StitchScope {
  window: Window & typeof globalThis;
  document: Document;
  setTimeout: typeof globalThis.setTimeout;
  clearTimeout: typeof globalThis.clearTimeout;
  setInterval: typeof globalThis.setInterval;
  clearInterval: typeof globalThis.clearInterval;
  requestAnimationFrame: typeof globalThis.requestAnimationFrame;
  cancelAnimationFrame: typeof globalThis.cancelAnimationFrame;
  /** Wraps the `three` namespace so scripts written for three r125–r128 render the same on the installed version. */
  useThree<T extends object>(namespace: T): T;
}

export type StitchBehavior = (scope: StitchScope) => StitchBehaviorResult | void;
