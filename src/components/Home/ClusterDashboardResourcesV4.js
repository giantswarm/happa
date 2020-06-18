import * as actionTypes from 'actions/actionTypes';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  selectLoadingFlagByAction,
  selectResourcesV4,
} from 'selectors/clusterSelectors';
import { Dot } from 'styles';
import RefreshableLabel from 'UI/RefreshableLabel';

import ClusterDashboardLoadingPlaceholder from './ClusterDashboardLoadingPlaceholder';
import ClusterDashboardNodes from './ClusterDashboardNodes';

function ClusterDashboardResourcesV4({
  cluster,
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
          cluster={cluster}
        />
      </RefreshableLabel>
      {cluster.kvm && (
        <span>
          <Dot style={{ paddingLeft: 0 }} />
          <RefreshableLabel value={storage}>
            <span>{storage ? storage : '0'} GB storage</span>
          </RefreshableLabel>
        </span>
      )}
    </div>
  );
}

ClusterDashboardResourcesV4.propTypes = {
  cluster: PropTypes.object,
  nodePools: PropTypes.array,
  resources: PropTypes.object,
  loadingClusters: PropTypes.bool,
  loadingStatus: PropTypes.bool,
};

const makeMapStateToProps = () => {
  const mapStateToProps = (state, props) => {
    const resources = selectResourcesV4();

    return {
      resources: resources(state, props.cluster.id),
      loadingClusters: selectLoadingFlagByAction(
        state,
        actionTypes.CLUSTERS_DETAILS_REQUEST
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
)(ClusterDashboardResourcesV4);
