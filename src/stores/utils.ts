import { createSelectorCreator, defaultMemoize } from 'reselect';
import { isEqual } from 'underscore';

/**
 * Create a selector factory, which uses Underscore's `isEqual`
 * comparison algorithm, instead of JavaScript triple-equal sign comparison.
 */
export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual
);

const actionTypeRegexp = /(.*)_(REQUEST|SUCCESS|ERROR|FINISHED|NOT_FOUND)/;
export function typeWithoutSuffix(actionType: string) {
  const matches = actionTypeRegexp.exec(actionType);
  if (!matches) return '';

  const [, requestName] = matches;

  return requestName;
}
