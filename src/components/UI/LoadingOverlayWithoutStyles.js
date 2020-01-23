import { spinner } from 'images';
import PropTypes from 'prop-types';
import React from 'react';

// LoadingOverlay takes one boolean prop 'loading' and will render a
// page centered loading spinner if 'loading' is true, or its children if
// 'loading' is false.
//
// Usage:
//
// <LoadingOverlay loading={something.hasLoaded}>
//    <h1>{something.that.only.is.here.when.fully.loaded}</h1>
// </LoadingOverlay>

function LoadingOverlayWithoutStyles(props) {
  if (props.loading) {
    return <img className='loader' src={spinner} />;
  }

  return props.children;
}

LoadingOverlayWithoutStyles.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node,
};

export default LoadingOverlayWithoutStyles;
