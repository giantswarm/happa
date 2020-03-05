import { push } from 'connected-react-router';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect, useDispatch } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { selectTargetRelease } from 'selectors/clusterSelectors';
import { AppRoutes } from 'shared/constants/routes';
import _ from 'underscore';

import GettingStarted from '../../GettingStarted/GettingStarted';
import ClusterDetailView from './ClusterDetailView';

const ClusterDetail = props => {
  const dispatch = useDispatch();

  if (!props.cluster) {
    new FlashMessage(
      `Cluster <code>${props.clusterId}</code> doesn't exist.`,
      messageType.INFO,
      messageTTL.MEDIUM
    );

    dispatch(push(AppRoutes.Home));

    return null;
  }

  return (
    <Breadcrumb
      data={{
        title: props.match.params.clusterId,
        pathname: props.match.url,
      }}
    >
      <Switch>
        <Route
          exact
          path={`${props.match.path}`}
          render={() => <ClusterDetailView {...props} />}
        />

        <Route
          path={`${props.match.path}/getting-started/`}
          render={() => <GettingStarted {...props} />}
        />

        <Redirect path={`${props.match.path}/*`} to={`${props.match.url}`} />
      </Switch>
    </Breadcrumb>
  );
};

ClusterDetail.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

ClusterDetail.propTypes = {
  catalogs: PropTypes.object,
  clusterActions: PropTypes.object,
  cluster: PropTypes.object,
  clusterId: PropTypes.string,
  credentials: PropTypes.object,
  dispatch: PropTypes.func,
  nodePools: PropTypes.object,
  organizationId: PropTypes.string,
  releaseActions: PropTypes.object,
  release: PropTypes.object,
  provider: PropTypes.string,
  targetRelease: PropTypes.object,
  user: PropTypes.object,
  isV5Cluster: PropTypes.bool,
};
function mapStateToProps(state, ownProps) {
  const clusterID = ownProps.match.params.clusterId;
  const cluster = state.entities.clusters.items[clusterID];
  const release = cluster
    ? state.entities.releases.items[cluster.release_version]
    : null;
  const isV5Cluster = state.entities.clusters.v5Clusters.includes(clusterID);
  const targetReleaseVersion = selectTargetRelease(state, cluster);

  return {
    credentials: state.entities.credentials,
    organizationId: ownProps.match.params.orgId,
    catalogs: state.entities.catalogs,
    cluster: cluster,
    clusterId: ownProps.match.params.clusterId,
    nodePools: state.entities.nodePools.items,
    provider: state.app.info.general.provider,
    release: release,
    targetRelease: state.entities.releases.items[targetReleaseVersion],
    user: state.app.loggedInUser,
    region: state.app.info.general.datacenter,
    isV5Cluster,
  };
}

export default connect(mapStateToProps)(ClusterDetail);
