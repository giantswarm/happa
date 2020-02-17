import { CLUSTERS_LIST_REQUEST } from 'actions/actionTypes';
import {
  batchedLayout,
  batchedOrganizationSelect,
} from 'actions/batchedActions';
import * as UserActions from 'actions/userActions';
import DocumentTitle from 'components/shared/DocumentTitle';
import { push } from 'connected-react-router';
import GiantSwarm from 'giantswarm';
import PropTypes from 'prop-types';
import React, { lazy, Suspense } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { selectLoadingFlagByAction } from 'selectors/clusterSelectors';
import {
  AccountSettingsRoutes,
  AppCatalogRoutes,
  AppRoutes,
  OrganizationsRoutes,
  UsersRoutes,
} from 'shared/constants/routes';

import Modals from './Modals/Modals';
import LoadingOverlay from './UI/LoadingOverlay';
import Navigation from './UI/Navigation/Navigation';

const defaultClient = GiantSwarm.ApiClient.instance;
defaultClient.basePath = window.config.apiEndpoint;
defaultClient.timeout = 10000;
const defaultClientAuth =
  defaultClient.authentications['AuthorizationHeaderToken'];

const AccountSettings = lazy(() =>
  import(
    /* webpackChunkName: "AccountSettings" */ './AccountSettings/AccountSettings'
  )
);
const AppCatalog = lazy(() =>
  import(/* webpackChunkName: "AppCatalog" */ './AppCatalog/AppCatalog')
);
const Home = lazy(() =>
  import(/* webpackChunkName: "Layout_Home" */ './Home/Home')
);
const Organizations = lazy(() =>
  import(
    /* webpackChunkName: "Organizations" */ './Organizations/Organizations'
  )
);
const Users = lazy(() =>
  import(/* webpackChunkName: "Users" */ './Users/Users')
);

class Layout extends React.Component {
  componentDidMount() {
    if (this.props.user) {
      defaultClientAuth.apiKeyPrefix = this.props.user.auth.scheme;
      defaultClientAuth.apiKey = this.props.user.auth.token;

      // This is the first component that loads, these are the
      // firsts calls happa makes to the API.
      this.props.dispatch(batchedLayout());
    } else {
      this.props.dispatch(push(AppRoutes.Login));
    }
  }

  selectOrganization = orgId => {
    const { dispatch } = this.props;

    dispatch(batchedOrganizationSelect(orgId));
    dispatch(push(AppRoutes.Home));
  };

  render() {
    return (
      <DocumentTitle>
        <LoadingOverlay loading={this.props.loadingClustersList}>
          <Modals />
          <Navigation
            onSelectOrganization={this.selectOrganization}
            organizations={this.props.organizations}
            selectedOrganization={this.props.selectedOrganization}
            showAppCatalog={Object.keys(this.props.catalogs.items).length > 0}
            user={this.props.user}
          />
          <Breadcrumb data={{ title: 'HOME', pathname: AppRoutes.Home }}>
            <div className='main col-9'>
              <Switch>
                <Route
                  exact
                  path={AppRoutes.Home}
                  render={routeProps => (
                    <Suspense fallback={<LoadingOverlay loading={true} />}>
                      <Home {...routeProps} />
                    </Suspense>
                  )}
                />
                <Route
                  path={AppCatalogRoutes.Home}
                  render={routeProps => (
                    <Suspense fallback={<LoadingOverlay loading={true} />}>
                      <AppCatalog {...routeProps} />
                    </Suspense>
                  )}
                />
                <Route
                  exact
                  path={UsersRoutes.Home}
                  render={routeProps => (
                    <Suspense fallback={<LoadingOverlay loading={true} />}>
                      <Users {...routeProps} />
                    </Suspense>
                  )}
                />
                <Route
                  path={OrganizationsRoutes.Home}
                  render={routeProps => (
                    <Suspense fallback={<LoadingOverlay loading={true} />}>
                      <Organizations {...routeProps} />
                    </Suspense>
                  )}
                />
                <Route
                  exact
                  path={AccountSettingsRoutes.Home}
                  render={routeProps => (
                    <Suspense fallback={<LoadingOverlay loading={true} />}>
                      <AccountSettings {...routeProps} />
                    </Suspense>
                  )}
                />
                <Redirect path='*' to={AppRoutes.Home} />
              </Switch>
            </div>
          </Breadcrumb>
        </LoadingOverlay>
      </DocumentTitle>
    );
  }
}

Layout.propTypes = {
  location: PropTypes.object,
  children: PropTypes.object,
  routes: PropTypes.array,
  params: PropTypes.object,
  match: PropTypes.object,
  user: PropTypes.object,
  organizations: PropTypes.object,
  selectedOrganization: PropTypes.string,
  firstLoadComplete: PropTypes.bool,
  dispatch: PropTypes.func,
  actions: PropTypes.object,
  catalogs: PropTypes.object,
  loadingClustersList: PropTypes.bool,
};

function mapStateToProps(state) {
  return {
    organizations: state.entities.organizations,
    user: state.app.loggedInUser,
    selectedOrganization: state.app.selectedOrganization,
    loadingClustersList: selectLoadingFlagByAction(
      state,
      CLUSTERS_LIST_REQUEST
    ),
    catalogs: state.entities.catalogs,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(UserActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
