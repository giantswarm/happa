import { catalogLoadIndex } from 'actions/catalogActions';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { AppCatalogRoutes } from 'shared/constants/routes';

import Detail from './AppDetail/AppDetail';
import AppList from './AppList/AppList';
import CatalogList from './CatalogList/CatalogList';

class AppCatalog extends React.Component {
  catalogLoadIndex = (catalog) => {
    return this.props.dispatch(catalogLoadIndex(catalog));
  };

  render() {
    return (
      <Breadcrumb
        data={{
          title: 'App Catalogs'.toUpperCase(),
          pathname: AppCatalogRoutes.Home,
        }}
      >
        <div className='app-catalog'>
          <Switch>
            <Route
              exact
              path={AppCatalogRoutes.AppDetail}
              render={(props) => (
                <Detail {...props} catalogLoadIndex={this.catalogLoadIndex} />
              )}
            />
            <Route
              exact
              path={AppCatalogRoutes.AppList}
              render={(props) => (
                <AppList {...props} catalogLoadIndex={this.catalogLoadIndex} />
              )}
            />
            <Route
              path={AppCatalogRoutes.Home}
              render={() => (
                <CatalogList
                  {...this.props}
                  catalogLoadIndex={this.catalogLoadIndex}
                />
              )}
            />
          </Switch>
        </div>
      </Breadcrumb>
    );
  }
}

AppCatalog.propTypes = {
  catalogs: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    catalogs: state.entities.catalogs,
    isAdmin: state.main.loggedInUser.isAdmin,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppCatalog);
