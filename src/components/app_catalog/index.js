'use strict';

import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Search from './search';
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
          title: 'App Katalog'.toUpperCase(),
          pathname: '/app-katalog/',
        }}
      >
        <div className='app-catalog'>
          <Search location={this.props.location} />
        </div>
      </Breadcrumb>
    );
  }
}

CatalogIndex.propTypes = {
  match: PropTypes.object,
  location: PropTypes.object,
};

function mapStateToProps() {
  return {};
}

function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CatalogIndex);
