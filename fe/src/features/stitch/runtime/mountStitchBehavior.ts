import { createStitchScope } from './createStitchScope';
import type { StitchBehavior, StitchHandler } from './types';

const HANDLER_ATTRIBUTE = 'data-st-on';

/**
 * Wires the inline handlers the generator moved into `data-st-on="click:3 change:4"`.
 * Listeners are attached per element (not delegated) so non-bubbling events such as
 * `mouseenter` behave like the original `on*` attributes.
 */
function bindInlineHandlers(root: HTMLElement, handlers: Record<string, StitchHandler>, screen: string) {
  const unbind: Array<() => void> = [];
  const elements = [root, ...root.querySelectorAll<HTMLElement>(`[${HANDLER_ATTRIBUTE}]`)];

  for (const element of elements) {
    const spec = element.getAttribute(HANDLER_ATTRIBUTE);
    if (!spec) continue;
    for (const entry of spec.split(' ')) {
      const [type, id] = entry.split(':');
      const handler = handlers[id];
      if (!type || !handler) continue;
      const listener = (event: Event) => {
        try {
          if (handler.call(element, event) === false) event.preventDefault();
        } catch (error) {
          console.error(`[stitch:${screen}] inline ${type} handler failed`, error);
        }
      };
      if (type === 'load' && element === root) {
        listener(new Event('load'));
        continue;
      }
      element.addEventListener(type, listener);
      unbind.push(() => element.removeEventListener(type, listener));
    }
  }
  return () => unbind.forEach((run) => run());
}

/** Runs a generated Stitch behavior against its screen root and returns the teardown. */
export function mountStitchBehavior(root: HTMLElement, behavior: StitchBehavior, screen: string): () => void {
  const handle = createStitchScope(root);
  let unbindHandlers: () => void = () => {};

  try {
    const result = behavior(handle.scope) ?? {};
    unbindHandlers = bindInlineHandlers(root, result.handlers ?? {}, screen);
    handle.flushLifecycle();
  } catch (error) {
    console.error(`[stitch:${screen}] behavior failed`, error);
  }

  return () => {
    unbindHandlers();
    handle.dispose();
  };
}
