import { useEffect, useRef, useState } from 'react';

/**
 * Delay variable change to make updates that happen too fast, **happen** slower :)
 * @param {Any} value Variable to track
 * @param {Number} limit Delay between changes
 */
function useDelayedChange(value, delay) {
  const [delayedValue, setDelayedValue] = useState(value);
  const [timeoutRef, setTimeoutRef] = useState(undefined);

  const isComponentMounted = useRef(true);
  const lastUpdateFinishTime = useRef(Date.now());

  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const currentTime = Date.now();
    const lastUpdateTime = lastUpdateFinishTime.current;

    let secondsToNextUpdate = 0;

    if (currentTime - lastUpdateTime < 0) {
      secondsToNextUpdate = delay + (lastUpdateTime - currentTime);
    }

    lastUpdateFinishTime.current = currentTime + delay;

    clearTimeout(timeoutRef);

    const ref = setTimeout(() => {
      if (isComponentMounted.current) {
        setDelayedValue(value);
      }
    }, secondsToNextUpdate);

    setTimeoutRef(ref);
  }, [value, delay]);

  return delayedValue;
}

export default useDelayedChange;
