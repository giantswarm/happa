import styled from '@emotion/styled';
import { spinner } from 'images';
import PropTypes from 'prop-types';
import React from 'react';
import SlideTransition from 'styles/transitions/SlideTransition';

const ProgressButtonStatusIndicator = styled.div`
  display: inline;
`;

const LoadingIndicator = ({ loading, loadingPosition, ...rest }) => (
  <ProgressButtonStatusIndicator {...rest}>
    <SlideTransition direction={loadingPosition} in={loading}>
      <img className={`loader ${loadingPosition}`} src={spinner} />
    </SlideTransition>
  </ProgressButtonStatusIndicator>
);

LoadingIndicator.propTypes = {
  loading: PropTypes.bool,
  loadingPosition: PropTypes.string,
};

export default LoadingIndicator;
