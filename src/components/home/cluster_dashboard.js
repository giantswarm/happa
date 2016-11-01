import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Button as BsButton, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router';
import Button from '../button';
import Gadget from './gadget';
import DonutGadget from './donut_gadget';
import NodeRow from './node_row';
import _ from 'underscore';
import {humanFileSize} from '../../lib/helpers';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';

var ClusterDashboard = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  cpuPercentUsed: function() {
    if (this.props.cluster.metrics) {
      return this.props.cluster.metrics.cpu_used.value;
    } else {
      return 0;
    }
  },

  cpuCores: function() {
    if (this.props.cluster.metrics) {
      return `${this.props.cluster.metrics.cpu_cores.value} cores total`;
    } else {
      return 'loading';
    }
  },

  ramPercentUsed: function() {
    if (this.props.cluster.metrics) {
      return this.props.cluster.metrics.ram_used.value / this.props.cluster.metrics.ram_available.value;
    } else {
      return 0;
    }
  },

  ramAmountFree: function() {
    if (this.props.cluster.metrics) {
      var bytesFree = humanFileSize(this.props.cluster.metrics.ram_available.value - this.props.cluster.metrics.ram_used.value);
      return `${bytesFree.value} ${bytesFree.unit} free`;
    } else {
      return 'loading';
    }

  },

  storagePercentUsed: function() {
    if (this.props.cluster.metrics && this.props.cluster.metrics.node_storage_used && this.props.cluster.metrics.node_storage_limit) {
      return this.props.cluster.metrics.node_storage_used.value / this.props.cluster.metrics.node_storage_limit.value;
    } else {
      return 0;
    }
  },

  storageAmountFree: function() {
    if (this.props.cluster.metrics && this.props.cluster.metrics.node_storage_limit && this.props.cluster.metrics.node_storage_used) {
      var bytesFree = humanFileSize(this.props.cluster.metrics.node_storage_limit.value - this.props.cluster.metrics.node_storage_used.value);
      return `${bytesFree.value} ${bytesFree.unit} free`;
    } else {
      return 'loading';
    }
  },

  configureDocsFor: function(clusterId) {
    this.props.actions.clusterSelect(clusterId);
    this.context.router.push('/docs/configure');
  },

  isLoading: function() {
    return (! this.props.cluster.metrics);
  },

  render: function() {
    return <div className={this.props.className + ' cluster-dashboard well ' + (this.isLoading() ? 'loading' : '')}>
      { this.props.children ?
        <div className="cluster-dashboard--overlay">
          {this.props.children}
        </div>
        :
        <div className="cluster-dashboard--overlay">
        </div>
      }
      {
        this.isLoading() ?
        <div className="cluster-dashboard--overlay">
          <img className='loader' src='/images/loader_oval_light.svg' />
        </div>
        :
        <div className="cluster-dashboard--overlay">
        </div>
      }
      <div className={'cluster-dashboard--inner'}>

        <h1>
          Cluster: {this.props.cluster.id}

          <ButtonGroup>
            <DropdownButton title="" id="add_node_dropdown" className="outline">
              <MenuItem onClick={this.configureDocsFor.bind(this, this.props.cluster.id)}>Access Via kubectl</MenuItem>
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
          <DonutGadget label='CPU' bottom_label={this.cpuCores()} large_label={Math.round(this.cpuPercentUsed() * 100) + '%'} color="#3ab6c7" percentage={this.cpuPercentUsed()} />
          <DonutGadget label='Node Storage' bottom_label={this.storageAmountFree()} large_label={Math.round(this.storagePercentUsed() * 100) + '%'} color="#d68a10" percentage={this.storagePercentUsed()} />

          <Gadget label='Network In'
                  bottom_label={this.props.cluster.metrics ? humanFileSize(this.props.cluster.metrics.network_traffic_incoming.value).unit + '/Sec' : 'loading'}
                  value={this.props.cluster.metrics ? humanFileSize(this.props.cluster.metrics.network_traffic_incoming.value).value : ''}
          />

          <Gadget label='Network Out'
                  bottom_label={this.props.cluster.metrics ? humanFileSize(this.props.cluster.metrics.network_traffic_outgoing.value).unit + '/Sec' : 'loading'}
                  value={this.props.cluster.metrics ? humanFileSize(this.props.cluster.metrics.network_traffic_outgoing.value).value : ''}
          />
          <Gadget label='Nodes' value={_.map(this.props.cluster.nodes, (node) => node).length}/>
          <Gadget label='Pods' value={this.props.cluster.metrics ? this.props.cluster.metrics.pod_count.value : ''}/>
          <Gadget label='Containers' value={this.props.cluster.metrics ? this.props.cluster.metrics.container_count.value : ''}/>
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
              <th className="node-table--pod-count-header">PODS</th>
              <th className="node-table--container-count-header">CONTAINERS</th>
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

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

module.exports = connect(null, mapDispatchToProps)(ClusterDashboard);