import styled from '@emotion/styled';
import { spinner } from 'images';
import PropTypes from 'prop-types';
import React from 'react';
import SlideTransition from 'styles/transitions/SlideTransition';

const ProgressButtonStatusIndicator = styled.div`
  display: inline;
`;

const LoadingIndicator = ({ loading, loadingPosition, timeout, ...rest }) => (
  <ProgressButtonStatusIndicator {...rest}>
    <SlideTransition direction={loadingPosition} in={loading} timeout={timeout}>
      <img className={`loader ${loadingPosition}`} src={spinner} />
    </SlideTransition>
  </ProgressButtonStatusIndicator>
);

LoadingIndicator.propTypes = {
  loading: PropTypes.bool,
  loadingPosition: PropTypes.string,
  timeout: PropTypes.number,
};

export default LoadingIndicator;
