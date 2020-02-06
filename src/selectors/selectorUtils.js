import { createSelectorCreator, defaultMemoize } from 'reselect';
import { isEqual } from 'underscore';

// create a "selector creator" that uses Underscore's isEqual instead of ===
export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual
);
