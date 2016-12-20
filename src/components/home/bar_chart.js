'use strict';

import React from 'react';
import ReactTimeout from 'react-timeout';

class BarChart extends React.Component {
  constructor(props) {
    super(props);

    var initialPercentage;

    if (props.animate) {
      initialPercentage = '0%';
    } else {
      initialPercentage = props.percentage;
    }

    this.state = {
      percentage: initialPercentage,
      firstShow: true
    };
  }

  componentDidMount() {
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
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      percentage: nextProps.percentage
    });
  }

  cappedPercentage() {
    return Math.min(this.state.percentage * 100, 100);
  }

  render() {
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
}

BarChart.propTypes = {
  animate: React.PropTypes.bool,
  percentage: React.PropTypes.number,
  setTimeout: React.PropTypes.func,
  outdated: React.PropTypes.bool,
  color: React.PropTypes.string,
  label: React.PropTypes.string
};

export default ReactTimeout(BarChart);