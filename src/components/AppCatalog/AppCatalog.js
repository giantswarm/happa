import { catalogLoadIndex, catalogsLoad } from 'actions/catalogActions';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { AppCatalogRoutes } from 'shared/constants/routes';

import Detail from './AppDetail/AppDetail';
import AppList from './AppList/AppList';
import Catalogs from './CatalogList/CatalogList';

class AppCatalog extends React.Component {
  componentDidMount() {
    this.props
      .dispatch(catalogsLoad())
      .then(catalogs => {
        const promises = Object.keys(catalogs).map(catalog => {
          return this.props.dispatch(catalogLoadIndex(catalogs[catalog]));
        });

        return Promise.all(promises);
      })
      .catch(error => {
        new FlashMessage(
          'Something went wrong while trying to load the catalogs.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

        // eslint-disable-next-line no-console
        console.error(error);
      });
  }

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
            <Route component={Detail} exact path={AppCatalogRoutes.AppDetail} />
            <Route component={AppList} exact path={AppCatalogRoutes.AppList} />
            <Route
              path={AppCatalogRoutes.Home}
              render={() => <Catalogs {...this.props} />}
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
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppCatalog);
