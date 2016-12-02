'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import BarChart from './bar_chart';
import {humanFileSize, truncate} from '../../lib/helpers';

var NodeRow = React.createClass({


  labelifyBytes: function(bytes) {
    var quantity = humanFileSize(bytes);
    return quantity.value + ' ' + quantity.unit;
  },

  render: function() {
    return (
      <tr>
        <td className="node-table--node-id">
          <span className="node-table--node-id-truncated">{truncate(this.props.nodeId)}</span>
          <span className="node-table--node-id-not-truncated">{this.props.nodeId}</span>
        </td>
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
            outdated={this.props.node.ram_used.outdated || this.props.node.ram_available.outdated}
            color="#003c78" />
        </td>
        <td className="node-table--barchart-container">
          <BarChart
            percentage={this.props.node.cpu_used.value}
            label={(this.props.node.cpu_used.value * 100).toFixed(0) + '%'}
            animate={this.props.animate}
            outdated={this.props.node.cpu_used.outdated}
            color="#3ab6c7" />
        </td>
        <td className="node-table--barchart-container node-table--barchart-storage">
          <BarChart
            percentage={this.props.node.node_storage_used.value / this.props.node.node_storage_limit.value}
            label={this.labelifyBytes(this.props.node.node_storage_used.value)}
            animate={this.props.animate}
            outdated={this.props.node.node_storage_used.outdated}
            color="#d68a10"/>

        </td>
        <td className="node-table--pod-count">
          {
            this.props.node.pod_count.outdated ?
            '...'
            :
            this.props.node.pod_count.value
          }
        </td>
        <td className="node-table--container-count">
          {
            this.props.node.container_count.outdated ?
            '...'
            :
            this.props.node.container_count.value
          }
        </td>
        <td className="node-table--net-in-value">
          {
            this.props.node.network_traffic_incoming.outdated ?
            '...'
            :
            <div>
              {humanFileSize(this.props.node.network_traffic_incoming.value).value}
              <span className="node-table--metric-unit">{humanFileSize(this.props.node.network_traffic_outgoing.value).unit}/Sec</span>
            </div>
          }
        </td>
        <td className="node-table--net-out-value">
          {
            this.props.node.network_traffic_outgoing.outdated ?
            '...'
            :
            <div>
              {humanFileSize(this.props.node.network_traffic_outgoing.value).value}
              <span className="node-table--metric-unit">{humanFileSize(this.props.node.network_traffic_outgoing.value).unit}/Sec</span>
            </div>
          }
        </td>
      </tr>
    );
  }
});

module.exports = NodeRow;