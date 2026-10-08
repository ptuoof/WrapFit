import { createThreeCompat, type ThreeCompatHandle } from './threeCompat';
import type { StitchScope } from './types';

type ListenerRecord = [EventTarget, string, EventListenerOrEventListenerObject, boolean | AddEventListenerOptions | undefined];

export interface StitchScopeHandle {
  scope: StitchScope;
  /** Runs the `DOMContentLoaded` and `load` callbacks the script registered, in browser order. */
  flushLifecycle(): void;
  dispose(): void;
}

/**
 * Builds the globals a Stitch script runs against.
 *
 * - `window` writes land in a private table, so `window.fn = …` from one screen
 *   never leaks onto the real window, while reads fall through to the real one.
 * - `document.body` is the screen root: Stitch treats `<body>` as its canvas, and the
 *   generated page moves the body's classes onto `[data-stitch]`.
 * - Every listener, timer, animation frame and WebGL renderer is recorded and released
 *   by `dispose()`.
 */
export function createStitchScope(root: HTMLElement): StitchScopeHandle {
  const realWindow = window;
  const realDocument = document;
  const exposed = new Map<PropertyKey, unknown>();
  const listeners: ListenerRecord[] = [];
  const timeouts = new Set<number>();
  const intervals = new Set<number>();
  const frames = new Set<number>();
  const readyQueue: Array<() => void> = [];
  const loadQueue: Array<() => void> = [];
  const threeHandles: Array<ThreeCompatHandle<object>> = [];
  const boundCache = new Map<PropertyKey, unknown>();

  const invoke = (target: EventTarget, listener: EventListenerOrEventListenerObject, type: string) => () => {
    const event = new Event(type);
    if (typeof listener === 'function') listener.call(target, event);
    else listener.handleEvent(event);
  };

  const trackedAddEventListener =
    (target: EventTarget) =>
    (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => {
      if (!listener) return;
      if (target === realDocument && type === 'DOMContentLoaded') {
        readyQueue.push(invoke(target, listener, type));
        return;
      }
      if (target === realWindow && type === 'load') {
        loadQueue.push(invoke(target, listener, type));
        return;
      }
      target.addEventListener(type, listener, options);
      listeners.push([target, type, listener, options]);
    };

  const timers = {
    setTimeout: ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
      const id = realWindow.setTimeout(() => {
        timeouts.delete(id);
        if (typeof handler === 'function') handler(...args);
      }, timeout);
      timeouts.add(id);
      return id;
    }) as typeof globalThis.setTimeout,
    clearTimeout: ((id?: number) => {
      if (id === undefined) return;
      timeouts.delete(id);
      realWindow.clearTimeout(id);
    }) as typeof globalThis.clearTimeout,
    setInterval: ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
      const id = realWindow.setInterval(() => {
        if (typeof handler === 'function') handler(...args);
      }, timeout);
      intervals.add(id);
      return id;
    }) as typeof globalThis.setInterval,
    clearInterval: ((id?: number) => {
      if (id === undefined) return;
      intervals.delete(id);
      realWindow.clearInterval(id);
    }) as typeof globalThis.clearInterval,
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      const id = realWindow.requestAnimationFrame((time) => {
        frames.delete(id);
        callback(time);
      });
      frames.add(id);
      return id;
    },
    cancelAnimationFrame: (id: number) => {
      frames.delete(id);
      realWindow.cancelAnimationFrame(id);
    },
  };

  // Lower-case functions are methods that need their receiver (alert, getComputedStyle,
  // matchMedia…). Upper-case ones are constructors and must stay unbound for `instanceof`.
  const bindMethod = (target: object, key: PropertyKey, value: unknown) => {
    if (typeof value !== 'function' || typeof key !== 'string' || !/^[a-z]/.test(key)) return value;
    const cacheKey = target === realDocument ? `document.${key}` : key;
    if (!boundCache.has(cacheKey)) boundCache.set(cacheKey, (value as (...args: unknown[]) => unknown).bind(target));
    return boundCache.get(cacheKey);
  };

  const documentProxy = new Proxy(realDocument, {
    get(target, key) {
      if (key === 'addEventListener') return trackedAddEventListener(target);
      if (key === 'body') return root;
      return bindMethod(target, key, Reflect.get(target, key, target));
    },
    set(target, key, value) {
      return Reflect.set(target, key, value, target);
    },
  });

  const windowProxy: Window & typeof globalThis = new Proxy(realWindow, {
    get(target, key) {
      if (exposed.has(key)) return exposed.get(key);
      if (key === 'addEventListener') return trackedAddEventListener(target);
      if (key === 'document') return documentProxy;
      if (key === 'window' || key === 'self' || key === 'globalThis') return windowProxy;
      if (typeof key === 'string' && key in timers) return timers[key as keyof typeof timers];
      return bindMethod(target, key, Reflect.get(target, key, target));
    },
    set(_target, key, value) {
      exposed.set(key, value);
      return true;
    },
    has(target, key) {
      return exposed.has(key) || key in target;
    },
  });

  const scope: StitchScope = {
    window: windowProxy,
    document: documentProxy,
    ...timers,
    useThree(namespace) {
      const handle = createThreeCompat(namespace);
      threeHandles.push(handle);
      return handle.three;
    },
  };

  return {
    scope,
    flushLifecycle() {
      for (const run of readyQueue.splice(0)) run();
      for (const run of loadQueue.splice(0)) run();
    },
    dispose() {
      for (const [target, type, listener, options] of listeners.splice(0)) {
        target.removeEventListener(type, listener, options);
      }
      for (const id of timeouts) realWindow.clearTimeout(id);
      for (const id of intervals) realWindow.clearInterval(id);
      for (const id of frames) realWindow.cancelAnimationFrame(id);
      timeouts.clear();
      intervals.clear();
      frames.clear();
      for (const handle of threeHandles.splice(0)) handle.dispose();
      exposed.clear();
      boundCache.clear();
    },
  };
}
