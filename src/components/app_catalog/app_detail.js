'use strict';

import { catalogsLoad } from '../../actions/catalogActions';
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
      <DocumentTitle title={'App Catalog | Giant Swarm '}>
        <React.Fragment>
          <h1>App Detail</h1>
        </React.Fragment>
      </DocumentTitle>
    );
  }
}

AppDetail.propTypes = {};

function mapStateToProps(state) {
  return {};
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
