import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const LoadingIndicator = props => (
  <div className='progress_button--status-indicator'>
    <ReactCSSTransitionGroup
      transitionName={`slide-${props.loadingPosition}`}
      transitionEnterTimeout={200}
      transitionLeaveTimeout={200}
    >
      {props.loading ? (
        <img
          className={'loader ' + props.loadingPosition}
          src='/images/loader_oval_light.svg'
        />
      ) : null}
    </ReactCSSTransitionGroup>
  </div>
);

LoadingIndicator.propTypes = {
  loading: PropTypes.bool,
  loadingPosition: PropTypes.string,
};

export default LoadingIndicator;
