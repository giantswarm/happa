'use strict';

import React from 'react';
import { humanFileSize } from '../../lib/helpers';
import PropTypes from 'prop-types';

class Gadget extends React.Component {
  classes() {
    var classes = [];

    if (this.props.metric.outdated) {
      classes.push('gadget-donut-outdated');
    }

    return classes.join(' ');
  }

  render() {
    return (
      <div className={'gadget ' + this.classes()}>
        <div
          className='gadget--inner'
          style={{ backgroundColor: this.props.backgroundColor }}
        >
          <div className='gadget--label'>{this.props.label}</div>
          <div className='gadget--value'>
            {this.props.metric.outdated
              ? '...'
              : humanFileSize(
                  this.props.metric.value,
                  true,
                  this.props.decimals
                ).value}
          </div>
          <div className='gadget--bottom-label'>
            {this.props.bottom_label(this.props.metric)}
          </div>
        </div>
      </div>
    );
  }
}

Gadget.propTypes = {
  metric: PropTypes.object,
  backgroundColor: PropTypes.string,
  label: PropTypes.string,
  decimals: PropTypes.number,
  bottom_label: PropTypes.func,
};

export default Gadget;
