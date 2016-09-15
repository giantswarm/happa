'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Button from '../button';

module.exports = React.createClass({
  polarToCartesian: function(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  },

  describeArc: function(x, y, radius, startAngle, endAngle){
    var start = this.polarToCartesian(x, y, radius, endAngle);
    var end = this.polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    var d = [
        'M', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');

    return d;
  },

  shadeColor: function(color, percent) {
    var f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return '#' + (0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
  },

  pieChart: function(percentage) {
    var degrees = percentage * 360.0;

    return <svg viewBox="-1 -1 2 2" >
      <g fill='none' fillRule='evenodd'>
        <g transform='translate(0 0)' strokeWidth='0.09'>
          <circle stroke={this.shadeColor(this.props.color, 0.01)} strokeOpacity='.5' cx='0' cy='0' r='0.8'/>
          <path stroke={this.props.color} d={this.describeArc(0, 0, 0.8, 0, degrees)}></path>
        </g>
      </g>
    </svg>;
  },

  render: function() {
    return (
      <div className='gadget gadget-donut'>
        <div className='gadget--inner'>
          <div className='gadget--label'>{this.props.label}</div>
          { this.pieChart(this.props.percentage) }
          <div className='gadget--value'>{this.props.large_label}</div>
          <div className='gadget--bottom-label'>{this.props.bottom_label}</div>
        </div>
      </div>
    );
  }
});