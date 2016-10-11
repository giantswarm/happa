'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Button from '../button';

module.exports = React.createClass({
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
      setTimeout(() => {
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

  render: function() {
    return (
      <div className='bar-chart'>
        <div className='bar-chart--bar' style={{width: `${this.state.percentage * 100}%`, backgroundColor: this.props.color}}>
        </div>
        <div className='bar-chart--value'>
          {this.props.label}
        </div>
      </div>
    );
  }
});