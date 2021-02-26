import * as React from 'react';

/**
 * An utility function for assigning an element to
 * multiple ref objects.
 * @param refs All the refs that you want to set.
 */
export function setMultipleRefs<T>(
  ...refs: React.Ref<T>[]
): React.RefCallback<T> {
  return (element: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as React.MutableRefObject<T | null>).current = element;
      }
    }
  };
}
