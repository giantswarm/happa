'use strict';

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

import React from 'react';
import BsButton from 'react-bootstrap/lib/Button';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Button extends React.Component {
  render() {
    return (
      <div className='progress_button--container'>
        <BsButton
          type={this.props.type}
          bsStyle={this.props.bsStyle}
          onClick={this.props.onClick}
          disabled={this.props.disabled || this.props.loading}>

          {this.props.children}
        </BsButton>

        <div className='progress_button--status-indicator'>
          <ReactCSSTransitionGroup
            transitionName='slide-right'
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}>
            {
              this.props.loading ? <img className='loader' src='/images/loader_oval_light.svg' /> : null
            }
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }
}

Button.propTypes = {
  type: React.PropTypes.string,
  bsStyle: React.PropTypes.string,
  onClick: React.PropTypes.func,
  disabled: React.PropTypes.bool,
  loading: React.PropTypes.bool,
  children: React.PropTypes.node
};

export default Button;