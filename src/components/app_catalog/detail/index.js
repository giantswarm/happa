import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import AppDetails from 'UI/app_details/index';
import DocumentTitle from 'react-document-title';
import InstallAppModal from './install_app_modal';
import LoadingOverlay from 'UI/loading_overlay';
import PropTypes from 'prop-types';
import React from 'react';

class AppDetail extends React.Component {
  imgError = () => {
    this.setState({
      imgError: true,
    });
  };

  constructor(props) {
    super(props);

    let query = new URLSearchParams(props.location.search);
    let q = query.get('q');

    this.state = {
      q,
    };
  }

  render() {
    return (
      <Breadcrumb
        data={{
          title: this.props.match.params.repo.toUpperCase(),
          pathname: '/app-catalogs/' + this.props.match.params.repo + '/',
        }}
      >
        <LoadingOverlay loading={this.props.repo.isFetchingIndex}>
          <Breadcrumb
            data={{
              title: this.props.app.name,
              pathname: this.props.match.url,
            }}
          >
            <DocumentTitle title={`${this.props.app.name} | Giant Swarm `}>
              <AppDetails
                app={this.props.app}
                imgError={this.imgError}
                imgErrorFlag={this.state.imgError}
                params={this.props.match.params}
                q={this.state.q}
                repo={this.props.repo}
              >
                <InstallAppModal
                  app={{
                    catalog: this.props.repo.metadata.name,
                    name: this.props.app.name,
                    version: this.props.app.version,
                  }}
                  selectedClusterID={this.props.selectedClusterID}
                />
              </AppDetails>
            </DocumentTitle>
          </Breadcrumb>
        </LoadingOverlay>
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
};

function mapStateToProps(state, ownProps) {
  var repo = decodeURIComponent(ownProps.match.params.repo);
  var appName = decodeURIComponent(ownProps.match.params.app);

  var appVersions = [{}];
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
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppDetail);
