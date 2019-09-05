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
import { Dot } from 'styles';
import { Link } from 'react-router-dom';
import { relativeDate } from 'lib/helpers.js';
import Button from 'UI/button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import ClusterIDLabel from 'UI/cluster_id_label';
import EmptyStateDisplay from 'UI/empty_state_display';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import RefreshableLabel from 'UI/refreshable_label';
import styled from '@emotion/styled';

const Wrapper = styled.div`
  display: flex;

  b {
    font-weight: 400;
  }
`;

const Label = styled.div`
  flex: 0 0 90px;
  font-size: 1.2em;
`;

const Content = styled.div`
  flex: 1;
  padding-right: 15px;
`;

const Title = styled.div`
  font-size: 1.2em;
  z-index: 120;
  position: relative;

  span {
    font-weight: bold;
  }
`;

const Buttons = styled.div`
  text-align: right;
  flex: 0 0 210px;

  .progress_button--container:last-child {
    margin-right: 0px;
  }
`;

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

  /**
   * Returns the amount of memory in this cluster.
   */
  memory() {
    const { cluster, isNodePool } = this.props;
    const { nodePools } = this.state;

    let memory = isNodePool
      ? getMemoryTotalNodePools(nodePools)
      : getMemoryTotal(cluster);

    return memory;
  }

  /**
   * Returns the amount of storage in this cluster.
   */
  storage() {
    const { cluster } = this.props;
    return getStorageTotal(cluster);
  }

  /**
   * Returns the amount of cpus in this cluster.
   */
  cpus() {
    const { cluster, isNodePool } = this.props;
    const { nodePools } = this.state;

    let cpus = isNodePool
      ? getCpusTotalNodePools(nodePools)
      : getCpusTotal(cluster);

    return cpus;
  }

  /**
   * Returns the amount of nodes in this cluster.
   */
  numNodes() {
    const { cluster, isNodePool } = this.props;
    const { nodePools } = this.state;

    let numNodes = isNodePool
      ? getNumberOfNodePoolsNodes(nodePools)
      : getNumberOfNodes(cluster);

    return numNodes;
  }

  /**
   * Returns a path to this cluster.
   */
  linkToCluster() {
    const { cluster, isNodePool } = this.props;

    const np = isNodePool ? '/np' : '';
    const linkToCluster = `/organizations/${cluster.owner}/clusters/${cluster.id}${np}`;

    return linkToCluster;
  }

  render() {
    const { cluster } = this.props;

    return (
      <Wrapper className='well'>
        {cluster &&
          <>
            <Label>
              <Link to={this.linkToCluster()}>
                <ClusterIDLabel clusterID={cluster.id} copyEnabled />
              </Link>
            </Label>

            <Content>
              <Title>
                <Link to={this.linkToCluster()}>
                  <RefreshableLabel dataItems={[cluster.name]}>
                    <span>{cluster.name}</span>
                  </RefreshableLabel>
                </Link>
              </Title>

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
                  <RefreshableLabel dataItems={[this.numNodes()]}>
                    <span>{cluster.nodePools.length} node pools, </span>
                  </RefreshableLabel>
                )}
                <RefreshableLabel dataItems={[this.numNodes()]}>
                  <span>{this.numNodes()} nodes</span>
                </RefreshableLabel>
                <Dot style={{ paddingLeft: 0 }} />
                <RefreshableLabel dataItems={[this.cpus()]}>
                  <span>{this.cpus() ? this.cpus() : '0'} CPU cores</span>
                </RefreshableLabel>
                <Dot style={{ paddingLeft: 0 }} />
                <RefreshableLabel dataItems={[this.memory()]}>
                  <span>{this.memory() ? this.memory() : '0'} GB RAM</span>
                </RefreshableLabel>
                {cluster.kvm ? (
                  <span>
                    <Dot style={{ paddingLeft: 0 }} />
                    <RefreshableLabel dataItems={[this.storage()]}>
                      <span>
                        {this.storage() ? this.storage() : '0'} GB storage
                      </span>
                    </RefreshableLabel>
                  </span>
                ) : (
                  undefined
                )}
              </div>
            </Content>

            <Buttons>
              {this.clusterYoungerThan30Days() ? (
                <ButtonGroup>
                  <Link
                    to={`/organizations/${cluster.owner}/clusters/${cluster.id}/getting-started/`}
                  >
                    <Button>
                      <i className='fa fa-start' />
                      Get Started
                    </Button>
                  </Link>
                </ButtonGroup>
              ) : (
                ''
              )}
            </Buttons>
          </>
        }
      </Wrapper>
    );
  }
}

ClusterDashboardItem.propTypes = {
  cluster: PropTypes.object,
  isNodePool: PropTypes.bool,
  nodePools: PropTypes.object,
};

export default ClusterDashboardItem;
