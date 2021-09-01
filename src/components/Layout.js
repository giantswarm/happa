import { withAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import MapiUnauthorized from 'Auth/MAPI/MapiUnauthorized';
import DocumentTitle from 'components/shared/DocumentTitle';
import GiantSwarm from 'giantswarm';
import AppsMAPI from 'MAPI/apps/Apps';
import Clusters from 'MAPI/clusters/Clusters';
import Experiments from 'MAPI/Experiments';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Switch } from 'react-router-dom';
import Route from 'Route';
import {
  AccountSettingsRoutes,
  AppsRoutes,
  ExceptionNotificationTestRoutes,
  MainRoutes,
  OrganizationsRoutes,
  UsersRoutes,
} from 'shared/constants/routes';
import * as featureFlags from 'shared/featureFlags';
import { supportsMapiApps, supportsMapiClusters } from 'shared/featureSupport';
import { batchedLayout, batchedOrganizationSelect } from 'stores/batchActions';
import { getLoggedInUser, selectHasAppAccess } from 'stores/main/selectors';
import { LoggedInUserTypes } from 'stores/main/types';

import AccountSettings from './AccountSettings/AccountSettings';
import Apps from './Apps/Apps';
import ExceptionNotificationTest from './ExceptionNotificationTest/ExceptionNotificationTest';
import Home from './Home/Home';
import MAPIOrganizations from './MAPI/organizations/OrganizationIndex';
import Modals from './Modals/Modals';
import Organizations from './Organizations/Organizations';
import Navigation from './UI/Controls/Navigation/Navigation';
import LoadingOverlay from './UI/Display/Loading/LoadingOverlay';
import Users from './Users/Users';

const ONE_SECOND = 1000;

const defaultClient = GiantSwarm.ApiClient.instance;
defaultClient.basePath = window.config.apiEndpoint;
defaultClient.timeout = window.config.defaultRequestTimeoutSeconds * ONE_SECOND;

class Layout extends React.Component {
  componentDidMount() {
    const { dispatch, authProvider } = this.props;

    dispatch(batchedLayout(authProvider));
  }

  selectOrganization = (orgId) => {
    const { dispatch } = this.props;
    dispatch(batchedOrganizationSelect(orgId, true));
  };

  render() {
    const { user, provider } = this.props;

    const supportsAppsViaMapi = user && supportsMapiApps(user, provider);
    const showApps =
      supportsAppsViaMapi || Object.keys(this.props.catalogs.items).length > 0;

    const showUsers = !featureFlags.flags.CustomerSSO.enabled;

    return (
      <DocumentTitle>
        <LoadingOverlay loading={!this.props.firstLoadComplete}>
          {this.props.hasAppAccess ? (
            <>
              <Modals />
              <Navigation
                onSelectOrganization={this.selectOrganization}
                organizations={this.props.organizations}
                selectedOrganization={this.props.selectedOrganization}
                showApps={showApps}
                showUsers={showUsers}
                user={user}
              />
              <Breadcrumb data={{ title: 'HOME', pathname: MainRoutes.Home }}>
                <div className='main' data-testid='main'>
                  <Switch>
                    {supportsMapiClusters(user, provider) ? (
                      <Route
                        component={Clusters}
                        exact
                        path={MainRoutes.Home}
                      />
                    ) : (
                      <Route component={Home} exact path={MainRoutes.Home} />
                    )}

                    {supportsAppsViaMapi ? (
                      <Route component={AppsMAPI} path={AppsRoutes.Home} />
                    ) : (
                      <Route component={Apps} path={AppsRoutes.Home} />
                    )}

                    {showUsers && (
                      <Route component={Users} exact path={UsersRoutes.Home} />
                    )}

                    {user.type === LoggedInUserTypes.MAPI ? (
                      <Route
                        component={MAPIOrganizations}
                        path={OrganizationsRoutes.Home}
                      />
                    ) : (
                      <Route
                        component={Organizations}
                        path={OrganizationsRoutes.Home}
                      />
                    )}

                    <Route
                      component={AccountSettings}
                      exact
                      path={AccountSettingsRoutes.Home}
                    />

                    {user.isAdmin && (
                      <Route
                        component={Experiments}
                        exact
                        path={AccountSettingsRoutes.Experiments}
                      />
                    )}

                    <Route
                      component={ExceptionNotificationTest}
                      exact
                      path={ExceptionNotificationTestRoutes.Home}
                    />

                    <Redirect path='*' to={MainRoutes.Home} />
                  </Switch>
                </div>
              </Breadcrumb>
            </>
          ) : (
            <MapiUnauthorized user={user} />
          )}
        </LoadingOverlay>
      </DocumentTitle>
    );
  }
}

function mapStateToProps(state) {
  return {
    organizations: state.entities.organizations,
    user: getLoggedInUser(state),
    provider: window.config.info.general.provider,
    selectedOrganization: state.main.selectedOrganization,
    catalogs: state.entities.catalogs,
    firstLoadComplete: state.main.firstLoadComplete,
    hasAppAccess: selectHasAppAccess(state),
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
)(withAuthProvider(Layout));
