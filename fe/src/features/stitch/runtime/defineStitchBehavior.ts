import type { StitchBehavior } from './types';

/** Identity helper so generated modules get the `StitchBehavior` contract checked at the boundary. */
export function defineStitchBehavior(behavior: StitchBehavior): StitchBehavior {
  return behavior;
}
