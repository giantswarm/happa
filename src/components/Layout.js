import { CLUSTERS_LIST_REQUEST } from 'actions/actionTypes';
import {
  batchedLayout,
  batchedOrganizationSelect,
} from 'actions/batchedActions';
import CPLoginPage from 'Auth/CP/CPLoginPage';
import DocumentTitle from 'components/shared/DocumentTitle';
import { push } from 'connected-react-router';
import GiantSwarm from 'giantswarm';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { selectLoadingFlagByAction } from 'selectors/clusterSelectors';
import {
  AccountSettingsRoutes,
  AppCatalogRoutes,
  AppRoutes,
  ExceptionNotificationTestRoutes,
  OrganizationsRoutes,
  UsersRoutes,
} from 'shared/constants/routes';
import FeatureFlags from 'shared/FeatureFlags';

import AccountSettings from './AccountSettings/AccountSettings';
import AppCatalog from './AppCatalog/AppCatalog';
import ExceptionNotificationTest from './ExceptionNotificationTest/ExceptionNotificationTest';
import Home from './Home/Home';
import Modals from './Modals/Modals';
import Organizations from './Organizations/Organizations';
import LoadingOverlay from './UI/LoadingOverlay';
import Navigation from './UI/Navigation/Navigation';
import Users from './Users/Users';

const ONE_SECOND = 1000;

const defaultClient = GiantSwarm.ApiClient.instance;
defaultClient.basePath = window.config.apiEndpoint;
defaultClient.timeout = window.config.defaultRequestTimeoutSeconds * ONE_SECOND;
const defaultClientAuth =
  defaultClient.authentications['AuthorizationHeaderToken'];

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

  selectOrganization = (orgId) => {
    const { dispatch } = this.props;
    dispatch(batchedOrganizationSelect(orgId));
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
            <div className='main'>
              <Switch>
                {/*prettier-ignore*/}
                <Route component={Home} exact path={AppRoutes.Home} />
                <Route component={AppCatalog} path={AppCatalogRoutes.Home} />
                <Route component={Users} exact path={UsersRoutes.Home} />
                <Route
                  component={Organizations}
                  path={OrganizationsRoutes.Home}
                />
                <Route
                  component={AccountSettings}
                  exact
                  path={AccountSettingsRoutes.Home}
                />
                <Route
                  component={ExceptionNotificationTest}
                  exact
                  path={ExceptionNotificationTestRoutes.Home}
                />

                {FeatureFlags.FEATURE_CP_ACCESS && (
                  <Route component={CPLoginPage} path={AppRoutes.CPAccess} />
                )}

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
  user: PropTypes.object,
  organizations: PropTypes.object,
  selectedOrganization: PropTypes.string,
  dispatch: PropTypes.func,
  catalogs: PropTypes.object,
  loadingClustersList: PropTypes.bool,
};

function mapStateToProps(state) {
  return {
    organizations: state.entities.organizations,
    user: state.main.loggedInUser,
    selectedOrganization: state.main.selectedOrganization,
    loadingClustersList: selectLoadingFlagByAction(
      state,
      CLUSTERS_LIST_REQUEST
    ),
    catalogs: state.entities.catalogs,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
