'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import BarChart from './bar_chart';

function humanFileSize(bytes, si) {
    // http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
    var thresh = si ? 1000 : 1024;

    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];

    var u = -1;

    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);

    return bytes.toFixed(1)+' '+units[u];
}

var NodeRow = React.createClass({
  render: function() {
    return (
      <tr>
        <td className="node-table--node-ip">{this.props.nodeId}</td>
        {/*
          <td className="node-table--status-label">
            <span className="node-table--status-label-running">RUNNING</span>
          </td>
        */}
        <td className="node-table--barchart-container">
          <BarChart
            percentage={this.props.node.ram_used.value / this.props.node.ram_available.value}
            label={humanFileSize(this.props.node.ram_used.value)}
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
            percentage={this.props.node.node_storage_used.value / this.props.node.node_storage_limit.value}
            label={humanFileSize(this.props.node.node_storage_used.value)}
            animate={this.props.animate}
            color="#d68a10"/>

        </td>
        <td className="node-table--container-count">
          {this.props.node.container_count.value}
        </td>
        <td className="node-table--net-in-value">
          {this.props.node.network_traffic_incoming.value.toFixed(1)}
          <span className="node-table--metric-unit">K/Sec</span>
        </td>
        <td className="node-table--net-out-value">
          {this.props.node.network_traffic_outgoing.value.toFixed(1)}
          <span className="node-table--metric-unit">K/Sec</span>
        </td>
      </tr>
    );
  }
});

module.exports = NodeRow;