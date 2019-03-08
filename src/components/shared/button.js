'use strict';

import BsButton from 'react-bootstrap/lib/Button';
import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// Button
//
// <Button
//   type='button|submit|reset'
//   bsStyle='primary|success|danger|info|warning|link'
//   loading=true|false
//   disabled=true|false
//   onClick=function>
//
//   Button Text
// </Button>
//
// A basic button. Can go into a 'loading' state, which will disable the button
// and show a spinner next to it.
//
// You can also disable the button by setting the disabled prop to true.
//

class Button extends React.Component {
  loadingIndicator = position => {
    return (
      <div className='progress_button--status-indicator'>
        <ReactCSSTransitionGroup
          transitionName={`slide-${position}`}
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}
        >
          {this.props.loading ? (
            <img
              className={'loader ' + this.props.loadingPosition}
              src='/images/loader_oval_light.svg'
            />
          ) : null}
        </ReactCSSTransitionGroup>
      </div>
    );
  };

  render() {
    return (
      <div className='progress_button--container'>
        {this.props.loadingPosition === 'left'
          ? this.loadingIndicator(this.props.loadingPosition)
          : undefined}

        <BsButton
          type={this.props.type}
          bsSize={this.props.bsSize}
          bsStyle={this.props.bsStyle}
          onClick={this.props.onClick}
          disabled={this.props.disabled || this.props.loading}
        >
          {this.props.children}
        </BsButton>

        {this.props.loadingPosition === 'right'
          ? this.loadingIndicator(this.props.loadingPosition)
          : undefined}
      </div>
    );
  }
}

Button.propTypes = {
  type: PropTypes.string,
  bsStyle: PropTypes.string,
  bsSize: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  loadingPosition: PropTypes.string,
  children: PropTypes.node,
};

Button.defaultProps = {
  loadingPosition: 'right',
};

export default Button;
