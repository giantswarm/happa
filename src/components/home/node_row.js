'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import BarChart from './bar_chart';
import {humanFileSize} from '../../lib/helpers';

var NodeRow = React.createClass({
  truncate: function(string, maxLength=20) {
   if (string.length > maxLength) {
    return string.substring(0,maxLength) + '\u2026';
   } else {
    return string;
   }
  },

  labelifyBytes: function(bytes) {
    var quantity = humanFileSize(bytes);
    return quantity.value + ' ' + quantity.unit;
  },

  render: function() {
    return (
      <tr>
        <td className="node-table--node-ip">{this.truncate(this.props.nodeId)}</td>
        {/*
          <td className="node-table--status-label">
            <span className="node-table--status-label-running">RUNNING</span>
          </td>
        */}
        <td className="node-table--barchart-container">
          <BarChart
            percentage={this.props.node.ram_used.value / this.props.node.ram_available.value}
            label={this.labelifyBytes(this.props.node.ram_used.value)}
            animate={this.props.animate}
            color="#003c78" />
        </td>
        <td className="node-table--barchart-container">
          <BarChart
            percentage={this.props.node.cpu_used.value}
            label={(this.props.node.cpu_used.value * 100).toFixed(0) + '%'}
            animate={this.props.animate}
            color="#3ab6c7" />
        </td>
        <td className="node-table--barchart-container node-table--barchart-storage">
          <BarChart
            percentage={this.props.node.node_storage_used.value / this.props.node.node_storage_limit.value}
            label={this.labelifyBytes(this.props.node.node_storage_used.value)}
            animate={this.props.animate}
            color="#d68a10"/>

        </td>
        <td className="node-table--container-count">
          {this.props.node.container_count.value}
        </td>
        <td className="node-table--pod-count">
          {this.props.node.pod_count.value}
        </td>
        <td className="node-table--net-in-value">
          {humanFileSize(this.props.node.network_traffic_incoming.value).value}
          <span className="node-table--metric-unit">{humanFileSize(this.props.node.network_traffic_outgoing.value).unit}/Sec</span>
        </td>
        <td className="node-table--net-out-value">
          {humanFileSize(this.props.node.network_traffic_outgoing.value).value}
          <span className="node-table--metric-unit">{humanFileSize(this.props.node.network_traffic_outgoing.value).unit}/Sec</span>
        </td>
      </tr>
    );
  }
});

module.exports = NodeRow;