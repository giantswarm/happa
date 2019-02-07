'use strict';

import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';

class CatalogIndex extends React.Component {
  state = {};

  constructor() {
    super();
  }

  render() {
    return (
      <Breadcrumb
        data={{
          title: 'App Catalog'.toUpperCase(),
          pathname:
            '/organizations/' +
            this.props.organizationId +
            '/clusters/' +
            this.props.clusterId +
            '/app-catalog/',
        }}
      >
        <Breadcrumb
          data={{
            title: this.props.clusterId,
            pathname:
              '/organizations/' +
              this.props.organizationId +
              '/clusters/' +
              this.props.clusterId,
          }}
        >
          <Breadcrumb
            data={{
              title: this.props.organizationId.toUpperCase(),
              pathname: '/organizations/' + this.props.organizationId,
            }}
          >
            <Breadcrumb
              data={{ title: 'ORGANIZATIONS', pathname: '/organizations/' }}
            >
              <DocumentTitle title={'App Catalog | Giant Swarm '}>
                <h1>App Catalog</h1>
              </DocumentTitle>
            </Breadcrumb>
          </Breadcrumb>
        </Breadcrumb>
      </Breadcrumb>
    );
  }
}

CatalogIndex.propTypes = {
  clusterId: PropTypes.string,
  organizationId: PropTypes.string,
};

function mapStateToProps(state, ownProps) {
  return {
    organizationId: ownProps.match.params.orgId,
    clusterId: ownProps.match.params.clusterId,
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CatalogIndex);
