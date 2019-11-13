import { useEffect, useRef, useState } from 'react';

/**
 * Delay variable change to make updates that happen too fast, **happen** slower :)
 * @param {Any} value Variable to track
 * @param {Number} limit Delay between changes
 */
function useDelayedChange(value, delay) {
  const [delayedValue, setDelayedValue] = useState(value);

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

    if (currentTime - lastUpdateTime >= 0) {
      secondsToNextUpdate = delay + (lastUpdateTime - currentTime);
    }

    lastUpdateFinishTime.current = currentTime + delay;

    setTimeout(() => {
      if (isComponentMounted.current) {
        setDelayedValue(value);
      }
    }, secondsToNextUpdate);
  }, [value]);

  return delayedValue;
}

export default useDelayedChange;
