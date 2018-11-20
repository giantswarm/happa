'use strict';

import React from 'react';
import PropTypes from 'prop-types';

class DonutGadget extends React.Component {
  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  describeArc(x, y, radius, startAngle, endAngle) {
    var start = this.polarToCartesian(x, y, radius, endAngle);
    var end = this.polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    var d = [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(' ');

    return d;
  }

  shadeColor(color, percent) {
    var f = parseInt(color.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent,
      R = f >> 16,
      G = (f >> 8) & 0x00ff,
      B = f & 0x0000ff;
    return (
      '#' +
      (
        0x1000000 +
        (Math.round((t - R) * p) + R) * 0x10000 +
        (Math.round((t - G) * p) + G) * 0x100 +
        (Math.round((t - B) * p) + B)
      )
        .toString(16)
        .slice(1)
    );
  }

  pieChart(percentage) {
    var cappedPercentage = Math.min(percentage, 0.9999); // glitch starts at exact value of 1
    // 0.9999 produces a full looking donut
    var degrees = cappedPercentage * 360.0;

    return (
      <svg viewBox='-2 -2 4 4'>
        <g fill='none' fillRule='evenodd'>
          <g transform='translate(0 0)' strokeWidth='0.2'>
            <circle
              stroke={this.shadeColor(this.props.color, 0.01)}
              strokeOpacity='.5'
              cx='0'
              cy='0'
              r='1.9'
            />
            <path
              stroke={this.props.color}
              d={this.describeArc(0, 0, 1.9, 0, degrees)}
            />
          </g>
        </g>
      </svg>
    );
  }

  percentage() {
    if (this.props.availableMetric.value === 0) {
      return 0;
    } else {
      return this.props.usedMetric.value / this.props.availableMetric.value;
    }
  }

  isOutdated() {
    return (
      this.props.usedMetric.outdated || this.props.availableMetric.outdated
    );
  }

  classes() {
    var classes = [];

    if (this.isOutdated()) {
      classes.push('gadget-donut-outdated');
    }

    return classes.join(' ');
  }

  render() {
    return (
      <div className={'gadget gadget-donut ' + this.classes()}>
        <div className='gadget--inner'>
          <div className='gadget--label'>{this.props.label}</div>
          {this.pieChart(this.percentage())}
          {this.isOutdated() ? (
            <div className='gadget--value'>...</div>
          ) : (
            <div className='gadget--value'>
              {this.props.large_label(this.percentage())}
            </div>
          )}

          <div className='gadget--bottom-label'>
            {this.isOutdated()
              ? 'Unavailable'
              : this.props.bottom_label(
                  this.props.availableMetric,
                  this.props.usedMetric
                )}
          </div>
        </div>
      </div>
    );
  }
}

DonutGadget.propTypes = {
  color: PropTypes.string,
  availableMetric: PropTypes.object,
  usedMetric: PropTypes.object,
  label: PropTypes.string,
  large_label: PropTypes.func,
  bottom_label: PropTypes.func,
};

export default DonutGadget;
