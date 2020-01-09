import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import cmp from 'semver-compare';
import _ from 'underscore';

import GettingStarted from '../../GettingStarted/GettingStarted';
import ClusterDetailView from './ClusterDetailView';

const ClusterDetail = props => (
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
  isNodePoolsCluster: PropTypes.bool,
};
function mapStateToProps(state, ownProps) {
  const cluster =
    state.entities.clusters.items[ownProps.match.params.clusterId];
  // eslint-disable-next-line init-declarations
  let release;
  // eslint-disable-next-line init-declarations
  let targetReleaseVersion;
  let isNodePoolsCluster = false;

  if (cluster) {
    if (cluster.release_version && cluster.release_version !== '') {
      release = state.entities.releases.items[cluster.release_version];
    }

    const activeReleases = _.filter(state.entities.releases.items, x => {
      return x.active;
    });

    const availableVersions = activeReleases.map(x => x.version).sort(cmp);

    // Guard against the release version of this cluster not being in the /v4/releases/
    // response.
    // This will ensure that Happa can calculate the target version for upgrade
    // correctly.
    if (availableVersions.indexOf(cluster.release_version) === -1) {
      availableVersions.push(cluster.release_version);
      availableVersions.sort(cmp);
    }

    if (
      availableVersions.length >
      availableVersions.indexOf(cluster.release_version)
    ) {
      targetReleaseVersion =
        availableVersions[
          availableVersions.indexOf(cluster.release_version) + 1
        ];
    }

    isNodePoolsCluster = state.entities.clusters.nodePoolsClusters.includes(
      cluster.id
    );
  }

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
    isNodePoolsCluster,
  };
}

export default connect(mapStateToProps)(ClusterDetail);
