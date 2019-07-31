import * as clusterActions from 'actions/clusterActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Dot } from 'styles';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { relativeDate } from 'lib/helpers.js';
import Button from 'UI/button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import ClusterIDLabel from 'UI/cluster_id_label';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import RefreshableLabel from 'UI/refreshable_label';

class ClusterDashboardItem extends React.Component {
  state = {
    enforceReRender: null,
  };

  componentDidMount() {
    this.registerReRenderInterval();
  }

  componentWillUnmount() {
    window.clearInterval(this.reRenderInterval);
  }

  /**
   * Activates periodic re-rendering to keep displayed info, like relative
   * dates, fresh.
   */
  registerReRenderInterval = () => {
    var refreshInterval = 10 * 1000; // 10 seconds
    this.reRenderInterval = window.setInterval(() => {
      // enforce re-rendering by state change
      this.setState({ enforceReRender: Date.now() });
    }, refreshInterval);
  };

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
          if (
            node.labels['role'] != 'master' &&
            node.labels['kubernetes.io/role'] != 'master'
          ) {
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

  /**
   * Returns true if the cluster is younger than 30 days
   */
  clusterYoungerThan30Days() {
    var age = Math.abs(
      moment(this.props.cluster.create_date)
        .utc()
        .diff(moment().utc()) / 1000
    );

    return age < 30 * 24 * 60 * 60;
  }

  accessCluster = () => {
    this.props.dispatch(
      push(
        '/organizations/' +
          this.props.cluster.owner +
          '/clusters/' +
          this.props.cluster.id +
          '/getting-started/'
      )
    );
  };

  render() {
    const { cluster, selectedOrganization } = this.props;
    var memory = this.getMemoryTotal();
    var storage = this.getStorageTotal();
    var cpus = this.getCpusTotal();
    var numNodes = this.getNumberOfNodes();

    return (
      <div className='cluster-dashboard-item well'>
        <div className='cluster-dashboard-item--label'>
          <Link
            to={
              '/organizations/' +
              selectedOrganization +
              '/clusters/' +
              cluster.id
            }
          >
            <ClusterIDLabel clusterID={cluster.id} copyEnabled />
          </Link>
        </div>

        <div className='cluster-dashboard-item--content'>
          <div className='cluster-dashboard-item--title'>
            <Link
              to={
                '/organizations/' +
                selectedOrganization +
                '/clusters/' +
                cluster.id
              }
            >
              <RefreshableLabel dataItems={[cluster.name]}>
                <span
                  className='cluster-dashboard-item--name'
                  style={{ fontWeight: 'bold' }}
                >
                  {cluster.name}
                </span>
              </RefreshableLabel>
            </Link>
          </div>

          <div>
            <RefreshableLabel dataItems={[cluster.release_version]}>
              <span>
                <i className='fa fa-version-tag' title='Release version' />{' '}
                {cluster.release_version}
              </span>
            </RefreshableLabel>
            <Dot style={{ paddingLeft: 0 }} />
            Created {relativeDate(cluster.create_date)}
          </div>
          <div>
            {cluster.nodePools && (
              <RefreshableLabel dataItems={[numNodes]}>
                <span>{cluster.nodePools.length} node pools, </span>
              </RefreshableLabel>
            )}
            <RefreshableLabel dataItems={[numNodes]}>
              <span>{numNodes} nodes</span>
            </RefreshableLabel>
            <Dot style={{ paddingLeft: 0 }} />
            <RefreshableLabel dataItems={[cpus]}>
              <span>{cpus ? cpus : '0'} CPU cores</span>
            </RefreshableLabel>
            <Dot style={{ paddingLeft: 0 }} />
            <RefreshableLabel dataItems={[memory]}>
              <span>{memory ? memory : '0'} GB RAM</span>
            </RefreshableLabel>
            {cluster.kvm ? (
              <span>
                <Dot style={{ paddingLeft: 0 }} />
                <RefreshableLabel dataItems={[storage]}>
                  <span>{storage ? storage : '0'} GB storage</span>
                </RefreshableLabel>
              </span>
            ) : (
              undefined
            )}
          </div>
        </div>

        <div className='cluster-dashboard-item--buttons'>
          {this.clusterYoungerThan30Days() ? (
            <ButtonGroup>
              <Button onClick={this.accessCluster}>
                <i className='fa fa-start' />
                Get Started
              </Button>
            </ButtonGroup>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}

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
