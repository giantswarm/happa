'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Button from '../button';

module.exports = React.createClass({
  render: function() {
    return (
      <div className='gadget'>
        <div className='gadget--inner' style={{backgroundColor: this.props.backgroundColor}}>
          <div className='gadget--label'>{this.props.label}</div>
          <div className='gadget--value'>{this.props.value}</div>
          <div className='gadget--bottom-label'>{this.props.bottom_label}</div>
        </div>
      </div>
    );
  }
});