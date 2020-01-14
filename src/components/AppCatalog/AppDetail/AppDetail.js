import DocumentTitle from 'components/shared/DocumentTitle';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import AppDetails from 'UI/AppDetails/AppDetails';
import LoadingOverlay from 'UI/LoadingOverlay';

import InstallAppModal from './InstallAppModal';

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

  render() {
    const { repo } = this.props;

    return (
      <Breadcrumb
        data={{
          title: this.props.match.params.repo.toUpperCase(),
          pathname: `/app-catalogs/${this.props.match.params.repo}/`,
        }}
      >
        <>
          <LoadingOverlay
            loading={
              !repo ||
              this.props.repo.isFetchingIndex ||
              this.props.loadingCluster
            }
          />
          {!(
            !repo ||
            this.props.repo.isFetchingIndex ||
            this.props.loadingCluster
          ) && (
            <Breadcrumb
              data={{
                title: this.props.app.name,
                pathname: this.props.match.url,
              }}
            >
              <DocumentTitle title={this.props.app.name}>
                {repo && (
                  <AppDetails
                    app={this.props.app}
                    imgError={this.imgError}
                    imgErrorFlag={this.state.imgError}
                    params={this.props.match.params}
                    q={this.state.q}
                    repo={repo}
                  >
                    <InstallAppModal
                      app={{
                        catalog: repo.metadata.name,
                        name: this.props.app.name,
                        version: this.props.app.version,
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
  app: PropTypes.object,
  appVersions: PropTypes.array,
  location: PropTypes.object,
  match: PropTypes.object,
  repo: PropTypes.object,
  selectedClusterID: PropTypes.string,
  loadingCluster: PropTypes.bool,
};

function mapStateToProps(state, ownProps) {
  const repo = decodeURIComponent(ownProps.match.params.repo);
  const appName = decodeURIComponent(ownProps.match.params.app);

  let appVersions = [{}];
  if (
    state.entities.catalogs.items[repo] &&
    !state.entities.catalogs.items[repo].isFetchingIndex &&
    state.entities.catalogs.items[repo].apps[appName]
  ) {
    appVersions = state.entities.catalogs.items[repo].apps[appName] || [{}];
  }

  return {
    app: appVersions[0],
    repo: state.entities.catalogs.items[repo],
    selectedClusterID: state.app.selectedClusterID,
    loadingCluster: state.loadingFlags.CLUSTER_LOAD_DETAILS,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppDetail);
