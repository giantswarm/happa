'use strict';

import _ from 'underscore';
import cmp from 'semver-compare';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ClusterDetailView from './view';
import { Route, Switch } from 'react-router-dom';

class ClusterDetailIndex extends React.Component {
  render() {
    return (
      <Switch>
        <Route
          exact
          path={`${this.props.match.path}`}
          render={() => <ClusterDetailView {...this.props} />}
        />
      </Switch>
    );
  }
}

ClusterDetailIndex.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  var cluster = state.entities.clusters.items[ownProps.match.params.clusterId];
  let release;
  let targetReleaseVersion;

  if (cluster) {
    if (cluster.release_version && cluster.release_version !== '') {
      release = state.entities.releases.items[cluster.release_version];
    }

    let activeReleases = _.filter(state.entities.releases.items, x => {
      return x.active;
    });

    let availableVersions = activeReleases.map(x => x.version).sort(cmp);

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
  }

  return {
    credentials: state.entities.credentials,
    organizationId: ownProps.match.params.orgId,
    cluster: cluster,
    clusterId: ownProps.match.params.clusterId,
    provider: state.app.info.general.provider,
    release: release,
    targetRelease: state.entities.releases.items[targetReleaseVersion],
    user: state.app.loggedInUser,
  };
}

export default connect(mapStateToProps)(ClusterDetailIndex);
