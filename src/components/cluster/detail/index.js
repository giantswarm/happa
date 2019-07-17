import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import _ from 'underscore';
import ClusterDetailView from './view';
import cmp from 'semver-compare';
import GettingStarted from '../../getting-started';
import PropTypes from 'prop-types';
import React from 'react';

class ClusterDetailIndex extends React.Component {
  render() {
    return (
      <Breadcrumb
        data={{
          title: this.props.match.params.clusterId,
          pathname: this.props.match.url,
        }}
      >
        <Switch>
          <Route
            exact
            path={`${this.props.match.path}`}
            render={() => <ClusterDetailView {...this.props} />}
          />

          <Route
            exact
            path={`${this.props.match.path}/np`}
            render={() => <ClusterDetailView {...this.props} isNodePoolView />}
          />

          <Route
            path={`${this.props.match.path}/getting-started/`}
            render={() => <GettingStarted {...this.props} />}
          />

          <Redirect
            path={`${this.props.match.path}/*`}
            to={`${this.props.match.url}`}
          />
        </Switch>
      </Breadcrumb>
    );
  }
}

ClusterDetailIndex.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

ClusterDetailIndex.propTypes = {
  catalogs: PropTypes.object,
  clusterActions: PropTypes.object,
  cluster: PropTypes.object,
  clusterId: PropTypes.string,
  credentials: PropTypes.object,
  dispatch: PropTypes.func,
  organizationId: PropTypes.string,
  releaseActions: PropTypes.object,
  release: PropTypes.object,
  provider: PropTypes.string,
  targetRelease: PropTypes.object,
  user: PropTypes.object,
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
    catalogs: state.entities.catalogs,
    cluster: cluster,
    clusterId: ownProps.match.params.clusterId,
    provider: state.app.info.general.provider,
    release: release,
    targetRelease: state.entities.releases.items[targetReleaseVersion],
    user: state.app.loggedInUser,
  };
}

export default connect(mapStateToProps)(ClusterDetailIndex);
