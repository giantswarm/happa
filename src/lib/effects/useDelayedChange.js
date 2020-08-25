import { useEffect, useRef, useState } from 'react';

/**
 * Delay variable change to make updates that happen too fast, **happen** slower :)
 * @param {Any} value Variable to track
 * @param {Number} delay Delay between changes
 */
function useDelayedChange(value, delay) {
  const [delayedValue, setDelayedValue] = useState(value);

  const isComponentMounted = useRef(true);
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const now = Date.now();
    const lastUpdate = lastUpdateRef.current;

    // Transition immediately the first time.
    let secondsToNextUpdate = 0;

    // BUT, if the last update is set to be in the future, i.e. we've already delayed
    // a value, and we're trying to change the value again before that delay's
    // timeout has triggered:
    if (lastUpdate > now) {
      // Then make sure we create a timeout with an appropriate delay:
      secondsToNextUpdate = delay + (lastUpdate - now);
    }

    // Save when the next update should happen:
    lastUpdateRef.current = now + (secondsToNextUpdate || delay);

    setTimeout(() => {
      if (isComponentMounted.current) {
        setDelayedValue(value);
      }
    }, secondsToNextUpdate);
  }, [value, delay]);

  return delayedValue;
}

export default useDelayedChange;
