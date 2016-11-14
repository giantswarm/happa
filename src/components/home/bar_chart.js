'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Button from '../button';
import ReactTimeout from 'react-timeout';

module.exports = ReactTimeout(React.createClass({
  getInitialState: function() {
    var initialPercentage;

    if (this.props.animate) {
      initialPercentage = '0%';
    } else {
      initialPercentage = this.props.percentage;
    }

    return {
      percentage: initialPercentage,
      firstShow: true
    };
  },

  componentDidMount: function() {
    // Set the percentage after 200ms
    // so they animate in thanks to the CSS transition on
    // bar-chart--bar

    if (this.props.animate) {
      this.props.setTimeout(() => {
        this.setState({
          percentage: this.props.percentage
        });
      }, 200);
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      percentage: nextProps.percentage
    });
  },

  cappedPercentage: function() {
    return Math.min(this.state.percentage * 100, 100);
  },

  render: function() {
    return (
      <div className={'bar-chart ' + ( this.props.outdated ? 'bar-chart--outdated' : '' )}>
        <div className='bar-chart--bar' style={{width: `${this.cappedPercentage()}%`, backgroundColor: this.props.color}}>
        </div>
        <div className='bar-chart--value'>
          {
            this.props.outdated ?
            '...'
            :
            this.props.label
          }
        </div>
      </div>
    );
  }
}));