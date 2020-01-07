import { keyframes } from '@emotion/core';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import usePrevious from 'lib/effects/usePrevious';

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

// As this hook has styles, we are going to pass a styles prop to overwrite/add any styles
function RefreshableLabel({ children, value, style }) {
  // used for outputting 'changed' css class
  const [hasDataChanged, setHasDataChanged] = useState(false);
  // used for storing previous value and so be able to compare with new value
  const prevValue = usePrevious(value);

  const compareData = () => {
    if (prevValue && value !== prevValue) {
      setHasDataChanged(true);
    }
    
return setTimeout(() => setHasDataChanged(false), animationDuration * 1000);
  };

  useEffect(() => {
    const timer = compareData();
    
return () => clearTimeout(timer);
  }, [compareData, value]);

  return (
    <Wrapper className={hasDataChanged && 'changed'} style={style}>
      {children}
    </Wrapper>
  );
}

RefreshableLabel.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default RefreshableLabel;
