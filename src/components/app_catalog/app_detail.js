'use strict';

import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';

class AppDetail extends React.Component {
  state = {};

  constructor() {
    super();
  }

  render() {
    return (
      <DocumentTitle title={'App Detail | Giant Swarm '}>
        <Breadcrumb
          data={{
            title: 'Test App',
            pathname: '/app-katalog/repo/test/',
          }}
        >
          <React.Fragment>
            <h1>App Detail</h1>
          </React.Fragment>
        </Breadcrumb>
      </DocumentTitle>
    );
  }
}

AppDetail.propTypes = {
  appVersions: PropTypes.array,
  match: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  var repo = decodeURIComponent(ownProps.match.params.repo);
  var appName = decodeURIComponent(ownProps.match.params.app);
  console.log(appName);
  var appVersions = [];
  if (
    state.entities.catalogs.items[repo] &&
    state.entities.catalogs.items[repo].apps[appName]
  ) {
    appVersions = state.entities.catalogs.items[repo].apps[appName];
  }

  console.log(appVersions);

  return {
    appVersions,
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
