import { createSelectorCreator, defaultMemoize } from 'reselect';
import { isEqual } from 'underscore';

// create a "selector creator" that uses Underscore's isEqual instead of ===
export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual
);

export const typeWithoutSuffix = (actionType) => {
  const matches = /(.*)_(REQUEST|SUCCESS|ERROR|FINISHED|NOT_FOUND)/.exec(
    actionType
  );
  const [, requestName] = matches;

  return requestName;
};
