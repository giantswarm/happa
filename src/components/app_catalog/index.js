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
    if (this.props.catalogs.lastUpdated === 0) {
      this.props.dispatch(catalogsLoad()).then(() => {
        this.setState({
          loading: false,
        });
      });
    } else {
      this.setState({
        loading: false,
      });
    }
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
          <Loading loading={this.state.loading}>
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
          </Loading>
        </div>
      </Breadcrumb>
    );
  }
}

function Loading(props) {
  if (props.loading) {
    return <img className='loader' src='/images/loader_oval_light.svg' />;
  } else {
    return props.children;
  }
}

CatalogIndex.propTypes = {
  catalogs: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    catalogs: state.entities.catalogs,
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
)(CatalogIndex);
