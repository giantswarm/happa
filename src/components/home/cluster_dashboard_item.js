import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as clusterActions from '../../actions/clusterActions';
import ClusterIDLabel from '../shared/cluster_id_label';
import { Link } from 'react-router-dom';
import { relativeDate } from '../../lib/helpers.js';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from '../shared/button';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';

class ClusterDashboardItem extends React.Component {
  getMemoryTotal() {
    var workers = this.getNumberOfNodes();
    if (workers === null || workers === 0 || !this.props.cluster.workers) {
      return null;
    }
    var m = workers * this.props.cluster.workers[0].memory.size_gb;
    return m.toFixed(2);
  }

  getStorageTotal() {
    var workers = this.getNumberOfNodes();
    if (workers === null || workers === 0 || !this.props.cluster.workers) {
      return null;
    }
    var s = workers * this.props.cluster.workers[0].storage.size_gb;
    return s.toFixed(2);
  }

  getCpusTotal() {
    var workers = this.getNumberOfNodes();
    if (workers === null || workers === 0 || !this.props.cluster.workers) {
      return null;
    }
    return workers * this.props.cluster.workers[0].cpu.cores;
  }

  getNumberOfNodes() {
    if (
      Object.keys(this.props.cluster).includes('status') &&
      this.props.cluster.status != null
    ) {
      var nodes = this.props.cluster.status.cluster.nodes;
      if (nodes.length == 0) {
        return 0;
      }

      var workers = 0;
      nodes.forEach(node => {
        if (Object.keys(node).includes('labels')) {
          if (node.labels['role'] != 'master') {
            workers++;
          }
        }
      });

      if (workers === 0) {
        // No node labels available? Fallback to assumption that one of the
        // nodes is master and rest are workers.
        workers = nodes.length - 1;
      }

      return workers;
    }

    return 0;
  }

  accessCluster() {
    this.props.dispatch(
      push(
        '/organizations/' +
          this.props.cluster.owner +
          '/clusters/' +
          this.props.cluster.id +
          '/getting-started/'
      )
    );
  }

  render() {
    var memory = this.getMemoryTotal();
    var storage = this.getStorageTotal();
    var cpus = this.getCpusTotal();
    return (
      <div className='cluster-dashboard-item well'>
        <div className='cluster-dashboard-item--label'>
          <Link
            to={
              '/organizations/' +
              this.props.selectedOrganization +
              '/clusters/' +
              this.props.cluster.id
            }
          >
            <ClusterIDLabel clusterID={this.props.cluster.id} copyEnabled />
          </Link>
        </div>

        <div className='cluster-dashboard-item--content'>
          <div className='cluster-dashboard-item--title'>
            <Link
              to={
                '/organizations/' +
                this.props.selectedOrganization +
                '/clusters/' +
                this.props.cluster.id
              }
            >
              <span
                className='cluster-dashboard-item--name'
                style={{ fontWeight: 'bold' }}
              >
                {this.props.cluster.name}
              </span>
            </Link>
          </div>

          <div>
            <i className='fa fa-version-tag' title='Release version' />{' '}
            {this.props.cluster.release_version}
            {' · Created '}
            {relativeDate(this.props.cluster.create_date)}
          </div>
          <div>
            {this.getNumberOfNodes()} nodes
            {' · '}
            {cpus ? cpus : '0'} CPU cores
            {' · '}
            {memory ? memory : '0'} GB RAM
            {this.props.cluster.kvm ? (
              <span>
                {' · '}
                {storage ? storage : '0'} GB storage
              </span>
            ) : (
              undefined
            )}
          </div>
        </div>

        <div className='cluster-dashboard-item--buttons'>
          <ButtonGroup>
            <Button onClick={this.accessCluster.bind(this)}>
              <i className='fa fa-start' />
              Get Started
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}

ClusterDashboardItem.contextTypes = {
  router: PropTypes.object,
};

ClusterDashboardItem.propTypes = {
  cluster: PropTypes.object,
  actions: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.array,
  selectedOrganization: PropTypes.string,
  animate: PropTypes.bool,
  dispatch: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  null,
  mapDispatchToProps
)(ClusterDashboardItem);
