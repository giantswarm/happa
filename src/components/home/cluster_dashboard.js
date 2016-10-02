import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Button as BsButton, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router';
import Button from '../button';
import Gadget from './gadget';
import DonutGadget from './donut_gadget';
import NodeRow from './node_row';
import _ from 'underscore';

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

var ClusterDashboard = React.createClass({
  ramPercentUsed: function() {
    if (this.props.cluster.metrics) {
      return this.props.cluster.metrics.ram_used.value / this.props.cluster.metrics.ram_available.value;
    } else {
      return 0;
    }
  },

  ramAmountFree: function() {
    if (this.props.cluster.metrics) {
      var bytesFree = this.props.cluster.metrics.ram_available.value - this.props.cluster.metrics.ram_used.value;
      return `${humanFileSize(bytesFree, false)} free`;
    } else {
      return 'loading';
    }

  },

  storagePercentUsed: function() {
    if (this.props.cluster.metrics) {
      return this.props.cluster.metrics.node_storage_used.value / this.props.cluster.metrics.node_storage_limit.value;
    } else {
      return 0;
    }
  },

  storageAmountFree: function() {
    if (this.props.cluster.metrics) {
      var bytesFree = this.props.cluster.metrics.node_storage_limit.value - this.props.cluster.metrics.node_storage_used.value;
      return `${humanFileSize(bytesFree, false)} free`;
    } else {
      return 0;
    }
  },

  render: function() {
    return <div className={'cluster-dashboard well'}>
      { this.props.children ?
        <div className="cluster-dashboard--overlay">
          {this.props.children}
        </div>
        :
        undefined
      }
      <div className={this.props.className}>
        <h1>
          Cluster: {this.props.cluster.id}

          <ButtonGroup>
            <DropdownButton title="" id="add_node_dropdown" className="outline">
              <MenuItem componentClass={Link} href='/docs/configure/clusterIdHere' to='/docs/configure/clusterIdHere'>Access Via kubectl</MenuItem>
              {/*
                <MenuItem>Open in Kubernetes Dashboard</MenuItem>
                <MenuItem>Configure Persistent Storage</MenuItem>
                <MenuItem>Launch Cluster Like This</MenuItem>
                <MenuItem>Rename cluster</MenuItem>
              */}
            </DropdownButton>
          </ButtonGroup>
        </h1>

        <div className='gadgets'>
          {/* <Gadget label='Status' value="OK" backgroundColor="#1a8735"/> */}
          <DonutGadget label='RAM' bottom_label={this.ramAmountFree()} large_label={Math.round(this.ramPercentUsed() * 100) + '%'} color='#003c78' percentage={this.ramPercentUsed()} />
          <DonutGadget label='CPU' bottom_label='10 cores total' large_label="12%" color="#3ab6c7" percentage={0.12} />
          <DonutGadget label='Node Storage' bottom_label={this.storageAmountFree()} large_label={Math.round(this.storagePercentUsed() * 100) + '%'} color="#d68a10" percentage={this.storagePercentUsed()} />

          <Gadget label='Network In'  bottom_label='MB/Sec' value={this.props.cluster.metrics ? this.props.cluster.metrics.network_traffic_incoming.value.toFixed(1) : ''}/>
          <Gadget label='Network Out' bottom_label='MB/Sec' value={this.props.cluster.metrics ? this.props.cluster.metrics.network_traffic_outgoing.value.toFixed(1) : ''}/>
          <Gadget label='Nodes' value={_.map(this.props.cluster.nodes, (node) => node).length}/>
          <Gadget label='Pods' value={this.props.cluster.metrics ? this.props.cluster.metrics.pod_count.value : ''}/>
        </div>

        <div className='seperator'></div>

        <h3>
          Nodes

          {/*
          <ButtonGroup>
            <BsButton className="outline">ADD NODE</BsButton>
            <DropdownButton title="" id="add_node_dropdown" className="outline">
              <MenuItem>Some</MenuItem>
              <MenuItem>Node</MenuItem>
              <MenuItem>Actions?</MenuItem>
            </DropdownButton>
          </ButtonGroup>
          */}
        </h3>

        <table className='table node-table'>
          <thead>
            <tr>
              <th>INSTANCE</th>
              {/*<th>STATUS</th>*/}
              <th>RAM USED</th>
              <th>CPU USAGE</th>
              <th>STORAGE USED</th>
              <th>CONTAINER COUNT</th>
              <th className="node-table--net-in-header">NET IN</th>
              <th className="node-table--net-out-header">NET OUT</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              _.map(_.sortBy(this.props.cluster.nodes, (node, key) => key), (node, key) => {
                return <NodeRow key={node.id} nodeId={node.id} node={node} animate={this.props.animate} />;
              })
            }
          </tbody>
        </table>
      </div>
    </div>;
  }
});

module.exports = ClusterDashboard;