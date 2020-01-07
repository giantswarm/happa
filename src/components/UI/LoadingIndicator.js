import PropTypes from 'prop-types';
import React from 'react';
import SlideTransition from 'styles/transitions/SlideTransition';
import { spinner } from 'images';
import styled from '@emotion/styled';

const ProgressButtonStatusIndicator = styled.div`
  display: inline;
`;

const LoadingIndicator = props => (
  <ProgressButtonStatusIndicator>
    <SlideTransition direction={props.loadingPosition} in={props.loading}>
      <img className={`loader ${  props.loadingPosition}`} src={spinner} />
    </SlideTransition>
  </ProgressButtonStatusIndicator>
);

LoadingIndicator.propTypes = {
  loading: PropTypes.bool,
  loadingPosition: PropTypes.string,
};

export default LoadingIndicator;
