import React, { useEffect, useState } from 'react';
import { keyframes } from 'styled-components';
import styled from 'styled-components';
import usePrevious from 'utils/hooks/usePrevious';

const yellowFade = keyframes`
  from {
    background: #e8d986;
  }
  to {
    background: transparent;
  }
`;

const animationDuration = 2; // in seconds

const Wrapper = styled.div`
  display: inline-block;
  line-height: 1.7;
  border-radius: 2px;
  margin-left: -5px;
  padding-left: 5px;
  padding-right: 5px;
  &.changed {
    animation: ${yellowFade} ${animationDuration}s ease;
  }
`;

/**
 * RefreshableLabel is an inline-block HTML container
 * that is used to temporarily highlight its content.
 *
 * It is typically used to indicate that its content
 * has changed. To detect a change, it provides a property
 *
 *   value (String or Number)
 *
 * which is a string or a number. When this
 * value changes, visual highlighting is triggered.
 */

function RefreshableLabel({ children, value, className }) {
  // used for outputting 'changed' css class
  const [hasDataChanged, setHasDataChanged] = useState(false);
  // used for storing previous value and so be able to compare with new value
  const prevValue = usePrevious(value);

  let labelClassName = className;
  if (hasDataChanged) labelClassName += ' changed';

  useEffect(() => {
    const sToMs = 1000;
    const compareData = () => {
      if (prevValue && value !== prevValue) {
        setHasDataChanged(true);
      }

      return setTimeout(
        () => setHasDataChanged(false),
        animationDuration * sToMs
      );
    };

    const timer = compareData();

    return () => clearTimeout(timer);
  }, [prevValue, value]);

  return <Wrapper className={labelClassName}>{children}</Wrapper>;
}

RefreshableLabel.defaultProps = {
  className: '',
};

export default RefreshableLabel;
