import { spinner } from 'images';
import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import styled from '@emotion/styled';

const ProgressButtonStatusIndicator = styled.div`
  display: inline;
`;

const LoadingIndicator = props => (
  <ProgressButtonStatusIndicator>
    <ReactCSSTransitionGroup
      transitionEnterTimeout={200}
      transitionLeaveTimeout={200}
      transitionName={`slide-${props.loadingPosition}`}
    >
      {props.loading && (
        <img className={'loader ' + props.loadingPosition} src={spinner} />
      )}
    </ReactCSSTransitionGroup>
  </ProgressButtonStatusIndicator>
);

LoadingIndicator.propTypes = {
  loading: PropTypes.bool,
  loadingPosition: PropTypes.string,
};

export default LoadingIndicator;
