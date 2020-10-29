import DocumentTitle from 'components/shared/DocumentTitle';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Constants } from 'shared/constants';
import { AppCatalogRoutes } from 'shared/constants/routes';
import { listCatalogs, loadAppReadme } from 'stores/appcatalog/actions';
import {
  CATALOG_LOAD_INDEX_REQUEST,
  CLUSTER_LOAD_APP_README_ERROR,
  CLUSTER_LOAD_APP_README_REQUEST,
} from 'stores/appcatalog/constants';
import { selectReadmeURL } from 'stores/appcatalog/selectors';
import { selectIsClusterAwaitingUpgrade } from 'stores/cluster/selectors';
import { isClusterCreating, isClusterUpdating } from 'stores/cluster/utils';
import { selectLoadingFlagByIdAndAction } from 'stores/entityloading/selectors';
import { clearError } from 'stores/error/actions';
import { selectErrorByAction } from 'stores/error/selectors';
import { selectLoadingFlagByAction } from 'stores/loading/selectors';
import AppDetails from 'UI/AppDetails/AppDetails';
import LoadingOverlay from 'UI/LoadingOverlay';

import InstallAppModal from './InstallAppModal';

function hasReadmeSource(appVersion) {
  if (!appVersion.sources) {
    return false;
  }

  return appVersion.sources.some((url) => url.endsWith(Constants.README_FILE));
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
    this.props.dispatch(clearError(CLUSTER_LOAD_APP_README_ERROR));
    this.loadReadme();
  }

  componentDidUpdate() {
    if (this.props.catalog) {
      this.props.catalogLoadIndex(this.props.catalog);
    }

    this.loadReadme();
  }

  /**
   * Dispatch an action to load readme associated with this app if it has one and
   * it hasn't been loaded yet.
   */
  loadReadme() {
    const {
      catalog,
      selectedAppVersion,
      dispatch,
      loadingReadme,
      errorLoadingReadme,
    } = this.props;

    // Skip if there was an error loading the readme.
    if (errorLoadingReadme) return;

    // Skip if there is no readme source to load.
    if (!hasReadmeSource(selectedAppVersion)) return;

    // Skip if the readme is already loaded.
    if (selectedAppVersion.readme) return;

    // Don't dispatch the action if a request is already going.
    if (loadingReadme) return;

    dispatch(loadAppReadme(catalog.metadata.name, selectedAppVersion));
  }

  // Generates a working base url for relative links in the readmes.
  readmeBaseURL() {
    if (!this.props.selectedAppVersion) return undefined;

    // https://raw.githubusercontent.com/giantswarm/efk-stack-app/v0.3.2/README.md
    let readmeURL = selectReadmeURL(this.props.selectedAppVersion);

    if (!readmeURL) return undefined;

    // https://github.com/giantswarm/efk-stack-app/v0.3.2/README.md
    readmeURL = readmeURL.replace(
      'https://raw.githubusercontent.com/',
      'https://github.com/'
    );

    const l = Constants.README_FILE.length;

    // https://github.com/giantswarm/efk-stack-app/v0.3.2/
    readmeURL = readmeURL.substring(0, readmeURL.length - l);

    // https://github.com/giantswarm/efk-stack-app/blob/v0.3.2/
    const readmeURLParts = readmeURL.split('/');
    const insertPoint = -2;
    readmeURLParts.splice(insertPoint, 0, 'blob');

    return readmeURLParts.join('/');
  }

  render() {
    const { catalog } = this.props;
    const appListPath = RoutePath.createUsablePath(AppCatalogRoutes.AppList, {
      catalogName: this.props.match.params.catalogName,
    });

    const loading = this.props.loadingIndex || this.props.loadingCatalogs;

    return (
      <Breadcrumb
        data={{
          title: this.props.match.params.catalogName.toUpperCase(),
          pathname: appListPath,
        }}
      >
        <>
          <LoadingOverlay loading={loading} />
          {!loading && (
            <Breadcrumb
              data={{
                title: this.props.selectedAppVersion.name,
                pathname: this.props.match.url,
              }}
            >
              <DocumentTitle title={this.props.selectedAppVersion.name}>
                {catalog && (
                  <AppDetails
                    app={this.props.selectedAppVersion}
                    readmeBaseURL={this.readmeBaseURL()}
                    appVersions={this.props.appVersions}
                    imgError={this.imgError}
                    imgErrorFlag={this.state.imgError}
                    params={this.props.match.params}
                    q={this.state.q}
                    catalog={catalog}
                  >
                    <InstallAppModal
                      app={{
                        catalog: catalog.metadata.name,
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
  catalog: PropTypes.object,
  selectedClusterID: PropTypes.string,
  dispatch: PropTypes.func,
  loadingReadme: PropTypes.bool,
  loadingCatalogs: PropTypes.bool,
  loadingIndex: PropTypes.bool,
  errorLoadingReadme: PropTypes.string,
  catalogLoadIndex: PropTypes.func,
};

function mapStateToProps(state, ownProps) {
  const catalogName = decodeURIComponent(ownProps.match.params.catalogName);
  const appName = decodeURIComponent(ownProps.match.params.app);
  const version = decodeURIComponent(ownProps.match.params.version);

  let appVersions = [{}];
  if (
    state.entities.catalogs.items[catalogName] &&
    !state.entities.catalogs.items[catalogName].isFetchingIndex &&
    state.entities.catalogs.items[catalogName].apps &&
    state.entities.catalogs.items[catalogName].apps[appName]
  ) {
    appVersions = state.entities.catalogs.items[catalogName].apps[appName] || [
      {},
    ];
  }

  const selectedAppVersion = appVersions.find(
    (appVersion) => appVersion.version === version
  );

  let selectedClusterID = state.main.selectedClusterID;
  const selectedCluster = state.entities.clusters.items[selectedClusterID];

  if (
    !selectedCluster ||
    isClusterCreating(selectedCluster) ||
    isClusterUpdating(selectedCluster) ||
    selectIsClusterAwaitingUpgrade(selectedClusterID)
  ) {
    selectedClusterID = undefined;
  }

  return {
    appVersions: appVersions,
    selectedAppVersion: selectedAppVersion || appVersions[0],
    catalog: state.entities.catalogs.items[catalogName],
    selectedClusterID,
    loadingCatalogs: selectLoadingFlagByAction(
      state,
      listCatalogs().types.request
    ),
    loadingIndex: selectLoadingFlagByIdAndAction(
      state,
      ownProps.match.params.catalogName,
      CATALOG_LOAD_INDEX_REQUEST
    ),
    loadingReadme: selectLoadingFlagByAction(
      state,
      CLUSTER_LOAD_APP_README_REQUEST
    ),
    errorLoadingReadme: selectErrorByAction(
      state,
      CLUSTER_LOAD_APP_README_ERROR
    ),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppDetail);
