import { keyframes } from '@emotion/core';
import _ from 'underscore';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ReactTimeout from 'react-timeout';
import styled from '@emotion/styled';

const yellowfade = keyframes`
  from {
    background: #e8d986;
  }
  to {
    background: transparent;
  }
`;

const Wrapper = styled.div`
  display: inline-block;
  line-height: 1.7;
  border-radius: 2px;
  margin-left: -5px;
  padding-left: 5px;
  padding-right: 5px;
  &.changed {
    animation: ${yellowfade} 2s ease;
  }
`;

/**
 * RefreshableLabel is an inline-block HTML container
 * that is used to temporarily highlight its content.
 *
 * It is typically used to indicated that its content
 * has changed. To detect a change, it provides a property
 *
 *   dataItems (Array)
 *
 * which is an array of arbitrary values. When this
 * array changes, visual highlighting is triggered.
 */

// As this hook has styles, we are going to pass a styles prop to overwrite/add any styles
export function RefreshableLabel({ children, dataItems, style }) {
  // used for outputting 'changed' css class
  const [hasDataChanged, setHasDataChanged] = useState(false);
  // used for storing dataItems and so be able to compare with new props
  const [data, setData] = useState(dataItems);

  const compareData = () => {
    if (dataItems === data) {
      setHasDataChanged(true);
      setData(dataItems);
    }

    setTimeout(() => setHasDataChanged(false), 5000);
  };

  useEffect(() => compareData(), [dataItems]);

  return (
    <Wrapper className={hasDataChanged && 'changed'} style={style}>
      {children}
    </Wrapper>
  );
}

RefreshableLabel.propTypes = {
  children: PropTypes.object,
  dataItems: PropTypes.array,
  style: PropTypes.object,
};

export default RefreshableLabel;
