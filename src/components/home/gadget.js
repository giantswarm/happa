'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Button from '../button';
import {humanFileSize} from '../../lib/helpers';

module.exports = React.createClass({
  classes: function() {
    var classes = [];

    if (this.props.metric.outdated) {
      classes.push('gadget-donut-outdated');
    }

    return classes.join(' ');
  },

  render: function() {
    return (
      <div className={'gadget ' + this.classes()}>
        <div className='gadget--inner' style={{backgroundColor: this.props.backgroundColor}}>
          <div className='gadget--label'>{this.props.label}</div>
          <div className='gadget--value'>
          {
            this.props.metric.outdated ?
            '...'
            :
            humanFileSize(this.props.metric.value).value
          }
          </div>
          <div className='gadget--bottom-label'>{this.props.bottom_label(this.props.metric)}</div>
        </div>
      </div>
    );
  }
});