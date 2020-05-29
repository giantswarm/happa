import * as actionTypes from 'actions/actionTypes';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  selectLoadingFlagByAction,
  selectResourcesV5,
} from 'selectors/clusterSelectors';
import { Dot } from 'styles';
import RefreshableLabel from 'UI/RefreshableLabel';

import ClusterDashboardLoadingPlaceholder from './ClusterDashboardLoadingPlaceholder';
import ClusterDashboardNodes from './ClusterDashboardNodes';

function ClusterDashboardResourcesV5({
  cluster,
  loadingClusters,
  loadingNodePools,
  loadingStatus,
  resources,
}) {
  const { memory, cores, numberOfNodes } = resources;
  const hasNodePools = numberOfNodes !== 0 && cluster?.nodePools?.length > 0;
  const loading = loadingClusters || loadingStatus || loadingNodePools;

  if (loading) return <ClusterDashboardLoadingPlaceholder isV5Cluster={true} />;

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
          numberOfNodes={numberOfNodes}
          createDate={cluster.create_date}
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

ClusterDashboardResourcesV5.propTypes = {
  cluster: PropTypes.object,
  isV5Cluster: PropTypes.bool,
  nodePools: PropTypes.array,
  resources: PropTypes.object,
  loadingClusters: PropTypes.bool,
  loadingNodePools: PropTypes.bool,
  loadingStatus: PropTypes.bool,
};

const makeMapStateToProps = () => {
  const mapStateToProps = (state, props) => {
    const resources = selectResourcesV5();

    return {
      resources: resources(state, props),
      loadingClusters: selectLoadingFlagByAction(
        state,
        actionTypes.CLUSTERS_DETAILS_REQUEST
      ),
      loadingNodePools: selectLoadingFlagByAction(
        state,
        actionTypes.NODEPOOLS_LOAD_REQUEST
      ),
      loadingStatus: selectLoadingFlagByAction(
        state,
        actionTypes.CLUSTER_LOAD_STATUS_REQUEST
      ),
    };
  };

  return mapStateToProps;
};

export default connect(
  makeMapStateToProps,
  undefined
)(ClusterDashboardResourcesV5);
