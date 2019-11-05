import * as clusterActions from 'actions/clusterActions';
import { bindActionCreators } from 'redux';
import {
  clusterNodePools,
  getCpusTotal,
  getCpusTotalNodePools,
  getMemoryTotal,
  getMemoryTotalNodePools,
  getNumberOfNodePoolsNodes,
  getNumberOfNodes,
  getStorageTotal,
} from 'utils/cluster_utils';
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
    nodePools: [],
  };

  componentDidMount() {
    this.registerReRenderInterval();

    if (this.props.isNodePool) {
      this.setClusterNodePools();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isNodePool && prevProps.nodePools !== this.props.nodePools) {
      this.setClusterNodePools();
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.reRenderInterval);
  }

  setClusterNodePools = () => {
    const { cluster, nodePools } = this.props;
    const nodePoolsData = clusterNodePools(nodePools, cluster);
    this.setState({ nodePools: nodePoolsData });
  };

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
    const { id, owner } = this.props.cluster;

    this.props.dispatch(
      push(`/organizations/${owner}/clusters/${id}/getting-started/`)
    );
  };

  render() {
    const { cluster, isNodePool, selectedOrganization } = this.props;
    const { nodePools } = this.state;

    var memory = isNodePool
      ? getMemoryTotalNodePools(nodePools)
      : getMemoryTotal(cluster);

    var storage = getStorageTotal(cluster);

    var cpus = isNodePool
      ? getCpusTotalNodePools(nodePools)
      : getCpusTotal(cluster);

    var numNodes = isNodePool
      ? getNumberOfNodePoolsNodes(nodePools)
      : getNumberOfNodes(cluster);

    const linkToCluster = `/organizations/${selectedOrganization}/clusters/${cluster.id}`;

    const hasNodePools = cluster.nodePools && cluster.nodePools.length !== 0;

    return (
      <div className='cluster-dashboard-item well'>
        <div className='cluster-dashboard-item--label'>
          <Link to={linkToCluster}>
            <ClusterIDLabel clusterID={cluster.id} copyEnabled />
          </Link>
        </div>

        <div className='cluster-dashboard-item--content'>
          <div className='cluster-dashboard-item--title'>
            <Link to={linkToCluster}>
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
            {numNodes !== 0 && hasNodePools && (
              <RefreshableLabel dataItems={[numNodes]}>
                <span>{cluster.nodePools.length} node pools, </span>
              </RefreshableLabel>
            )}
            <RefreshableLabel dataItems={[numNodes]}>
              <span>{numNodes} nodes</span>
            </RefreshableLabel>
            {numNodes !== 0 && hasNodePools && (
              <>
                <Dot style={{ paddingLeft: 0 }} />
                <RefreshableLabel dataItems={[cpus]}>
                  <span>{cpus ? cpus : '0'} CPU cores</span>
                </RefreshableLabel>
                <Dot style={{ paddingLeft: 0 }} />
                <RefreshableLabel dataItems={[memory]}>
                  <span>{memory ? memory : '0'} GB RAM</span>
                </RefreshableLabel>
              </>
            )}
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
  isNodePool: PropTypes.bool,
  nodePools: PropTypes.object,
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
