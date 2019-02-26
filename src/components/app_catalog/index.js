'use strict';

import AppDetail from './app_detail';
import { Breadcrumb } from 'react-breadcrumbs';
import { catalogsLoad } from '../../actions/catalogActions';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Search from './search';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

class CatalogIndex extends React.Component {
  state = {
    loading: true,
  };

  constructor() {
    super();
  }

  componentDidMount() {
    this.props.dispatch(catalogsLoad()).then(() => {
      this.setState({
        loading: false,
      });
    });
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
          <Switch>
            <Route
              exact //
              path='/app-katalog/'
              component={Search}
            />
            <Route
              exact //
              path='/app-katalog/:repo/:app'
              component={AppDetail}
            />
          </Switch>
        </div>
      </Breadcrumb>
    );
  }
}

CatalogIndex.propTypes = {
  dispatch: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object,
};

function mapStateToProps() {
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
)(CatalogIndex);
