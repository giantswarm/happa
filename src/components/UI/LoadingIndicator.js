import { spinner } from 'images';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import SlideTransition from 'styles/transitions/SlideTransition';

const ProgressButtonStatusIndicator = styled.div`
  display: inline;
`;

const LoadingIndicator = ({ loading, loadingPosition, timeout, ...rest }) => (
  <ProgressButtonStatusIndicator
    {...rest}
    role='progressbar'
    aria-valuetext='Loading…'
    aria-busy='true'
    aria-live='assertive'
    aria-hidden={!loading}
  >
    <SlideTransition direction={loadingPosition} in={loading} timeout={timeout}>
      <img
        className={`loader ${loadingPosition}`}
        src={spinner}
        alt='loading'
      />
    </SlideTransition>
  </ProgressButtonStatusIndicator>
);

LoadingIndicator.propTypes = {
  loading: PropTypes.bool,
  loadingPosition: PropTypes.string,
  timeout: PropTypes.number,
};

export default LoadingIndicator;
