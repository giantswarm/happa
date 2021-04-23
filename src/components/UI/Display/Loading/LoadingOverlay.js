import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

// LoadingOverlay takes one boolean prop 'loading' and will render a
// page centered loading spinner if 'loading' is true, or its children if
// 'loading' is false.
//
// Usage:
//
// <LoadingOverlay loading={something.hasLoaded}>
//    <h1>{something.that.only.is.here.when.fully.loaded}</h1>
// </LoadingOverlay>

const LoadingOverlayOuter = styled.div`
  position: fixed;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  text-align: center;
`;

const LoadingOverlayInner = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 200px;
  margin-left: -100px;
`;

function LoadingOverlay(props) {
  if (props.loading) {
    return (
      <LoadingOverlayOuter role='progressbar' aria-label='Loading…'>
        <LoadingOverlayInner>
          <img className='loader' src='/images/loader_oval_light.svg' />
        </LoadingOverlayInner>
      </LoadingOverlayOuter>
    );
  } else if (props.children) {
    return props.children;
  }

  return null;
}

LoadingOverlay.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node,
};

export default LoadingOverlay;
