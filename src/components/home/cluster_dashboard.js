import React from 'react';
import { ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router';
import Gadget from './gadget';
import DonutGadget from './donut_gadget';
import CPUGadget from './cpu_gadget';
import NodeRow from './node_row';
import _ from 'underscore';
import {humanFileSize} from '../../lib/helpers';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';

class ClusterDashboard extends React.Component {
  constructor(props) {
    super(props);
  }

  configureDocsFor(clusterId) {
    this.props.actions.clusterSelect(clusterId);
    this.context.router.push('/getting-started/configure');
  }

  showDeleteClusterModal(clusterId) {
    this.props.actions.clusterDelete(clusterId);
  }

  bytesFreeLabel(availableMetric, usedMetric) {
    var bytesFree = humanFileSize(availableMetric.value - usedMetric.value);
    return `${bytesFree.value} ${bytesFree.unit} free`;
  }

  decoratePercentage(percentage) {
    return Math.round(percentage * 100) + '%';
  }

  decoratePerSecond(metric) {
    return humanFileSize(metric.value).unit + '/Sec';
  }

  render() {
    return <div className={this.props.className + ' cluster-dashboard well ' + (this.props.cluster.errorLoadingMetrics ? 'loading' : '')}>
      {
        this.props.children ?
        <div className="cluster-dashboard--overlay">
          {this.props.children}
        </div>
        :
        undefined
      }

      <img className='loader' src='/images/loader_oval_light.svg' />

      <div className={'cluster-dashboard--inner'}>
        <h1>
          {this.props.cluster.name}<div className="cluster-dashboard--id"> — <code>{this.props.cluster.id}</code></div>

          <ButtonGroup>
            <DropdownButton title="" id="add_node_dropdown" className="outline">
              <MenuItem onClick={this.configureDocsFor.bind(this, this.props.cluster.id)}>Access Via kubectl</MenuItem>
              <MenuItem componentClass={Link}
                        href={'/organizations'}
                        to={'/organizations/' + this.props.selectedOrganization + '/clusters/' + this.props.cluster.id }>
                        Cluster Details
              </MenuItem>
              <MenuItem onClick={this.showDeleteClusterModal.bind(this, this.props.cluster.id)}>Delete Cluster</MenuItem>

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
          <DonutGadget
            label='RAM'
            bottom_label={this.bytesFreeLabel}
            large_label={this.decoratePercentage}
            color='#003c78'
            availableMetric={this.props.cluster.metrics.ram_available}
            usedMetric={this.props.cluster.metrics.ram_used}
          />

          <CPUGadget
            label='CPU'
            bottom_label={this.coresTotalLabel}
            large_label={this.decoratePercentage}
            color="#3ab6c7"
            cores={this.props.cluster.metrics.cpu_cores}
            cpuUsed={this.props.cluster.metrics.cpu_used}
          />

          <DonutGadget
            label='Node Storage'
            bottom_label={this.bytesFreeLabel}
            large_label={this.decoratePercentage}
            color="#d68a10"
            availableMetric={this.props.cluster.metrics.node_storage_limit}
            usedMetric={this.props.cluster.metrics.node_storage_used}
          />

          <Gadget label='Network In'
                  metric={this.props.cluster.metrics.network_traffic_incoming}
                  decimals={1}
                  bottom_label={this.decoratePerSecond}
          />

          <Gadget label='Network Out'
                  metric={this.props.cluster.metrics.network_traffic_outgoing}
                  decimals={1}
                  bottom_label={this.decoratePerSecond}
          />

          <Gadget label='Nodes'
                  metric={{value: _.map(this.props.cluster.nodes, (node) => node).length}}
                  decimals={0}
                  bottom_label={() => {}} />

          <Gadget label='Pods'
                  metric={this.props.cluster.metrics.pod_count}
                  decimals={0}
                  bottom_label={() => {}} />

          <Gadget label='Containers'
                  metric={this.props.cluster.metrics.container_count}
                  decimals={0}
                  bottom_label={() => {}} />
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
              _.map(_.sortBy(this.props.cluster.nodes, (node, key) => key), (node) => {
                return <NodeRow key={node.id} nodeId={node.id} node={node} animate={this.props.animate} />;
              })
            }
          </tbody>
        </table>
      </div>
    </div>;
  }
}

ClusterDashboard.contextTypes = {
  router: React.PropTypes.object
};

ClusterDashboard.propTypes = {
  cluster: React.PropTypes.object,
  actions: React.PropTypes.object,
  className: React.PropTypes.string,
  children: React.PropTypes.object,
  selectedOrganization: React.PropTypes.string,
  animate: React.PropTypes.bool
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

export default connect(null, mapDispatchToProps)(ClusterDashboard);