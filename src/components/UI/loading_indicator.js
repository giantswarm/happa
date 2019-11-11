import { spinner } from 'images';
import BaseTransition from 'styles/transitions/BaseTransition';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const ProgressButtonStatusIndicator = styled.div`
  display: inline;
`;

const LoadingIndicator = props => (
  <ProgressButtonStatusIndicator>
    <BaseTransition
      in={props.loading}
      classNames={`slide-${props.loadingPosition}`}
    >
      <img className={'loader ' + props.loadingPosition} src={spinner} />
    </BaseTransition>
  </ProgressButtonStatusIndicator>
);

LoadingIndicator.propTypes = {
  loading: PropTypes.bool,
  loadingPosition: PropTypes.string,
};

export default LoadingIndicator;
