import React from 'react';
import { connect } from 'react-redux';
import {
  CLUSTER_LOAD_STATUS_REQUEST,
  CLUSTERS_DETAILS_REQUEST,
} from 'stores/cluster/constants';
import { selectResourcesV4 } from 'stores/cluster/selectors';
import { selectLoadingFlagByAction } from 'stores/loading/selectors';
import { Dot } from 'styles';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

import ClusterDashboardLoadingPlaceholder from './ClusterDashboardLoadingPlaceholder';
import ClusterDashboardNodes from './ClusterDashboardNodes';

function ClusterDashboardResourcesV4({
  cluster,
  isClusterCreating,
  loadingClusters,
  loadingStatus,
  resources,
}) {
  const { storage, numberOfNodes } = resources;
  const loading = loadingClusters || loadingStatus;

  if (loading) {
    return <ClusterDashboardLoadingPlaceholder isV5Cluster={false} />;
  }

  return (
    <div data-testid='cluster-resources'>
      <RefreshableLabel value={numberOfNodes}>
        <ClusterDashboardNodes
          numberOfNodes={numberOfNodes}
          isClusterCreating={isClusterCreating}
        />
      </RefreshableLabel>
      {cluster.kvm && (
        <span>
          <Dot style={{ paddingLeft: 0 }} />
          <RefreshableLabel value={storage}>
            <span>{storage} GB storage</span>
          </RefreshableLabel>
        </span>
      )}
    </div>
  );
}

const makeMapStateToProps = () => {
  const mapStateToProps = (state, props) => {
    const resources = selectResourcesV4();

    return {
      resources: resources(state, props.cluster.id),
      loadingClusters: selectLoadingFlagByAction(
        state,
        CLUSTERS_DETAILS_REQUEST
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
)(ClusterDashboardResourcesV4);
