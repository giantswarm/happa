import { loadAppReadme } from 'actions/appActions';
import DocumentTitle from 'components/shared/DocumentTitle';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { AppCatalogRoutes } from 'shared/constants/routes';
import AppDetails from 'UI/AppDetails/AppDetails';
import LoadingOverlay from 'UI/LoadingOverlay';

import InstallAppModal from './InstallAppModal';

function hasReadmeSource(appVersion) {
  if (!appVersion.sources) {
    return false;
  }

  return appVersion.sources.some((url) => url.endsWith('README.md'));
}

class AppDetail extends React.Component {
  imgError = () => {
    this.setState({
      imgError: true,
    });
  };

  constructor(props) {
    super(props);

    const query = new URLSearchParams(props.location.search);
    const q = query.get('q');

    // eslint-disable-next-line react/state-in-constructor
    this.state = {
      q,
    };
  }

  componentDidMount() {
    this.loadReadme();
  }

  componentDidUpdate() {
    this.loadReadme();
  }

  // Dispatch an action to load readme associated with this app if it has one and
  // it hasn't been loaded yet.
  loadReadme() {
    const { repo, selectedAppVersion, dispatch } = this.props;

    // Skip if there is no readme source to load.
    if (!hasReadmeSource(selectedAppVersion)) return;

    // Skip if the readme is already loaded.
    if (selectedAppVersion.readme) return;

    dispatch(loadAppReadme(repo.metadata.name, selectedAppVersion));
  }

  render() {
    const { repo } = this.props;
    const appListPath = RoutePath.createUsablePath(AppCatalogRoutes.AppList, {
      repo: this.props.match.params.repo,
    });

    return (
      <Breadcrumb
        data={{
          title: this.props.match.params.repo.toUpperCase(),
          pathname: appListPath,
        }}
      >
        <>
          <LoadingOverlay loading={!repo || this.props.repo.isFetchingIndex} />
          {!(
            !repo ||
            this.props.repo.isFetchingIndex ||
            this.props.loadingCluster
          ) && (
            <Breadcrumb
              data={{
                title: this.props.selectedAppVersion.name,
                pathname: this.props.match.url,
              }}
            >
              <DocumentTitle title={this.props.selectedAppVersion.name}>
                {repo && (
                  <AppDetails
                    app={this.props.selectedAppVersion}
                    appVersions={this.props.appVersions}
                    imgError={this.imgError}
                    imgErrorFlag={this.state.imgError}
                    params={this.props.match.params}
                    q={this.state.q}
                    repo={repo}
                  >
                    <InstallAppModal
                      app={{
                        repo: repo.metadata.name,
                        name: this.props.selectedAppVersion.name,
                        versions: this.props.appVersions,
                      }}
                      selectedClusterID={this.props.selectedClusterID}
                    />
                  </AppDetails>
                )}
              </DocumentTitle>
            </Breadcrumb>
          )}
        </>
      </Breadcrumb>
    );
  }
}

AppDetail.propTypes = {
  selectedAppVersion: PropTypes.object,
  appVersions: PropTypes.array,
  location: PropTypes.object,
  match: PropTypes.object,
  repo: PropTypes.object,
  selectedClusterID: PropTypes.string,
  loadingCluster: PropTypes.bool,
  dispatch: PropTypes.func,
};

function mapStateToProps(state, ownProps) {
  const repo = decodeURIComponent(ownProps.match.params.repo);
  const appName = decodeURIComponent(ownProps.match.params.app);
  const version = decodeURIComponent(ownProps.match.params.version);

  let appVersions = [{}];
  if (
    state.entities.catalogs.items[repo] &&
    !state.entities.catalogs.items[repo].isFetchingIndex &&
    state.entities.catalogs.items[repo].apps[appName]
  ) {
    appVersions = state.entities.catalogs.items[repo].apps[appName] || [{}];
  }

  const selectedAppVersion = appVersions.find(
    (appVersion) => appVersion.version === version
  );

  return {
    appVersions: appVersions,
    selectedAppVersion: selectedAppVersion || appVersions[0],
    repo: state.entities.catalogs.items[repo],
    selectedClusterID: state.main.selectedClusterID,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppDetail);
