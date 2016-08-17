"use strict";

// Button
//
// <Button
//   type=string
//   loading=bool
//   disabled=bool
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
      <div className="progress_button--container">
        <BsButton
          type={this.props.type}
          bsStyle="primary"
          onClick={this.props.onClick}
          disabled={this.props.disabled || this.props.loading}>

          {this.props.children}
        </BsButton>

        <ReactCSSTransitionGroup
          transitionName="slide-right"
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}>
          {
            this.props.loading ? <img className="loader" src="/images/loader_oval_light.svg" /> : null
          }
        </ReactCSSTransitionGroup>
      </div>
    );
  }

}

export default Button;