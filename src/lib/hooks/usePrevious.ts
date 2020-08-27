import { useEffect, useRef } from 'react';

/**
 * Store the previous value of a variable.
 * Note: The value updates automatically on each component update.
 * @param value - The current value.
 * @source https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

export default usePrevious;
