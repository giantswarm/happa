import { push } from 'connected-react-router';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect, useDispatch } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { selectTargetRelease } from 'selectors/clusterSelectors';
import { AppRoutes } from 'shared/constants/routes';

import GettingStarted from '../../GettingStarted/GettingStarted';
import ClusterDetailView from './ClusterDetailView';

const ClusterDetail = ({ match, cluster, clusterId, ...rest }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!cluster) {
      new FlashMessage(
        `Cluster <code>${clusterId}</code> doesn't exist.`,
        messageType.INFO,
        messageTTL.MEDIUM
      );

      dispatch(push(AppRoutes.Home));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!cluster) return null;

  return (
    <Breadcrumb
      data={{
        title: match.params.clusterId,
        pathname: match.url,
      }}
    >
      <Switch>
        <Route
          path={`${match.path}/getting-started/`}
          render={() => <GettingStarted {...rest} />}
        />

        <Route
          path={`${match.path}`}
          render={() => (
            <ClusterDetailView
              {...rest}
              cluster={cluster}
              clusterId={clusterId}
            />
          )}
        />
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
    provider: state.main.info.general.provider,
    release: release,
    targetRelease: state.entities.releases.items[targetReleaseVersion],
    user: state.main.loggedInUser,
    region: state.main.info.general.datacenter,
    isV5Cluster,
  };
}

export default connect(mapStateToProps)(ClusterDetail);
