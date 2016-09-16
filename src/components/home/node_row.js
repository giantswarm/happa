'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import BarChart from './bar_chart';
import {connect} from 'react-redux';

var NodeRow = React.createClass({
  render: function() {
    return (
      <tr>
        <td>{this.props.node_internal_ip}</td>
        {/*
        <td className="node-table--node-ip">{this.props.node.ip}</td>
        <td className="node-table--status-label">
          <span className="node-table--status-label-running">RUNNING</span>
        </td>
        <td className="node-table--barchart-container">
          <BarChart
            percentage={this.props.node.ramUsed}
            label={this.props.node.ramUsed}
            animate={this.props.animate}
            color="#003c78" />
        </td>
        <td className="node-table--barchart-container">
          <BarChart
            percentage={this.props.node.cpuUsed}
            label={this.props.node.cpuUsed}
            animate={this.props.animate}
            color="#3ab6c7" />
        </td>
        <td className="node-table--barchart-container node-table--barchart-storage">
          <BarChart
            percentage={this.props.node.storageUsed}
            label={this.props.node.storageUsed}
            animate={this.props.animate}
            color="#d68a10"/>

        </td>
        <td className="node-table--net-in-value">
          {this.props.node.netIn}
          <span className="node-table--metric-unit">K/Sec</span>
        </td>
        <td className="node-table--net-out-value">
          {this.props.node.netOut}
          <span className="node-table--metric-unit">K/Sec</span>
        </td>
        <td>

        </td>
        */}
      </tr>
    );
  }
});

function mapStateToProps(state, ownProps) {
  return {
    node: state.entities.nodes.items[ownProps.node_internal_ip]
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(NodeRow);