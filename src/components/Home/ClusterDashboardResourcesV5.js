import React from 'react';
import { connect } from 'react-redux';
import {
  CLUSTER_LOAD_STATUS_REQUEST,
  CLUSTERS_DETAILS_REQUEST,
} from 'stores/cluster/constants';
import { selectLoadingFlagByAction } from 'stores/loading/selectors';
import { NODEPOOL_MULTIPLE_LOAD_REQUEST } from 'stores/nodepool/constants';
import { makeV5ResourcesSelector } from 'stores/nodepool/selectors';
import { Dot } from 'styles';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

import ClusterDashboardLoadingPlaceholder from './ClusterDashboardLoadingPlaceholder';
import ClusterDashboardNodes from './ClusterDashboardNodes';

function ClusterDashboardResourcesV5({
  cluster,
  isClusterCreating,
  loadingClusters,
  loadingNodePools,
  loadingStatus,
  resources,
}) {
  const { memory, cores, numberOfNodes } = resources;
  const hasNodePools = numberOfNodes !== 0 && cluster?.nodePools?.length > 0;
  const loading = loadingClusters || loadingStatus || loadingNodePools;

  if (loading) {
    return <ClusterDashboardLoadingPlaceholder isV5Cluster={true} />;
  }

  return (
    <div data-testid='cluster-resources'>
      {hasNodePools && (
        <RefreshableLabel value={numberOfNodes}>
          <span>
            {cluster.nodePools.length === 1
              ? '1 node pool'
              : `${cluster.nodePools.length} node pools`}
            ,{' '}
          </span>
        </RefreshableLabel>
      )}
      <RefreshableLabel value={numberOfNodes}>
        <ClusterDashboardNodes
          isClusterCreating={isClusterCreating}
          numberOfNodes={numberOfNodes}
        />
      </RefreshableLabel>
      {hasNodePools && (
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
    </div>
  );
}

const makeMapStateToProps = () => {
  const mapStateToProps = (state, props) => {
    const resources = makeV5ResourcesSelector();

    return {
      resources: resources(state, props),
      loadingClusters: selectLoadingFlagByAction(
        state,
        CLUSTERS_DETAILS_REQUEST
      ),
      loadingNodePools: selectLoadingFlagByAction(
        state,
        NODEPOOL_MULTIPLE_LOAD_REQUEST
      ),
      loadingStatus: selectLoadingFlagByAction(
        state,
        CLUSTER_LOAD_STATUS_REQUEST
      ),
    };
  };

  return mapStateToProps;
};

export default connect(
  makeMapStateToProps,
  undefined
)(ClusterDashboardResourcesV5);
