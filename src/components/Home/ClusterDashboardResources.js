import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  selectResourcesV4,
  selectResourcesV5,
} from 'selectors/clusterSelectors';
import { Dot } from 'styles';
import RefreshableLabel from 'UI/RefreshableLabel';

const ClusterDetailsDiv = styled.div`
  height: 27px;
  img {
    height: 22px;
  }
`;

function ClusterDashboardResources({ cluster, resources }) {
  const { memory, storage, cores, numberOfNodes } = resources;
  const hasNodePools = cluster.nodePools && cluster.nodePools.length !== 0;

  return (
    <ClusterDetailsDiv>
      <div>
        {numberOfNodes !== 0 && hasNodePools && (
          <RefreshableLabel value={numberOfNodes}>
            <span>{cluster.nodePools.length} node pools, </span>
          </RefreshableLabel>
        )}
        <RefreshableLabel value={numberOfNodes}>
          <span>
            {numberOfNodes} {numberOfNodes === 1 ? 'node' : 'nodes'}
          </span>
        </RefreshableLabel>
        {numberOfNodes !== 0 && hasNodePools && (
          <>
            <Dot style={{ paddingLeft: 0 }} />
            <RefreshableLabel value={cores}>
              <span>{cores ? cores : '0'} CPU cores</span>
            </RefreshableLabel>
            <Dot style={{ paddingLeft: 0 }} />
            <RefreshableLabel value={memory}>
              <span>{memory ? memory : '0'} GB RAM</span>
            </RefreshableLabel>
          </>
        )}
        {cluster.kvm && (
          <span>
            <Dot style={{ paddingLeft: 0 }} />
            <RefreshableLabel value={storage}>
              <span>{storage ? storage : '0'} GB storage</span>
            </RefreshableLabel>
          </span>
        )}
      </div>
    </ClusterDetailsDiv>
  );
}

ClusterDashboardResources.propTypes = {
  cluster: PropTypes.object,
  isNodePool: PropTypes.bool,
  nodePools: PropTypes.array,
  resources: PropTypes.object,
};

const makeMapStateToProps = () => {
  const resourcesV4 = selectResourcesV4();
  const resourcesV5 = selectResourcesV5();
  const mapStateToProps = (state, props) => {
    return {
      resources: props.isNodePool
        ? resourcesV5(state, props)
        : resourcesV4(state, props),
      loadingClusters: state.loadingFlags.CLUSTERS_LOAD_DETAILS,
      loadingNodePools: state.loadingFlags.NODEPOOLS_LOAD,
      loadingStatus: state.loadingFlags.CLUSTER_LOAD_STATUS,
    };
  };

  return mapStateToProps;
};

export default connect(
  makeMapStateToProps,
  undefined
)(ClusterDashboardResources);
