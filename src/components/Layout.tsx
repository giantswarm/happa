import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import MapiUnauthorized from 'Auth/MAPI/MapiUnauthorized';
import DocumentTitle from 'components/shared/DocumentTitle';
import GiantSwarm from 'giantswarm';
import AppsMAPI from 'MAPI/apps/Apps';
import Clusters from 'MAPI/clusters/Clusters';
import ClusterAppSchemaTester from 'MAPI/clusters/CreateClusterAppBundles/ClusterAppSchemaTester';
import Experiments from 'MAPI/Experiments';
import Permissions from 'MAPI/permissions/Permissions';
import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasAppAccess } from 'MAPI/permissions/utils';
import {
  AccountSettingsRoutes,
  AppsRoutes,
  ExceptionNotificationTestRoutes,
  MainRoutes,
  OrganizationsRoutes,
} from 'model/constants/routes';
import { supportsMapiApps, supportsMapiClusters } from 'model/featureSupport';
import {
  batchedLayout,
  batchedOrganizationSelect,
} from 'model/stores/batchActions';
import { getLoggedInUser } from 'model/stores/main/selectors';
import { LoggedInUserTypes } from 'model/stores/main/types';
import { IState } from 'model/stores/state';
import React, { useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Switch } from 'react-router-dom';
import { Dispatch } from 'redux';
import Route from 'Route';
import OrganizationCreatedNote from 'UI/Display/Organizations/OrganizationCreatedNote';

import Apps from './Apps/Apps';
import ExceptionNotificationTest from './ExceptionNotificationTest/ExceptionNotificationTest';
import Home from './Home/Home';
import MAPIOrganizations from './MAPI/organizations/OrganizationIndex';
import Modals from './Modals/Modals';
import Organizations from './Organizations/Organizations';
import Navigation from './UI/Controls/Navigation/Navigation';
import LoadingOverlay from './UI/Display/Loading/LoadingOverlay';

const ONE_SECOND = 1000;

const defaultClient = GiantSwarm.ApiClient.instance;
defaultClient.basePath = window.config.apiEndpoint;
defaultClient.timeout = window.config.defaultRequestTimeoutSeconds * ONE_SECOND;

const Layout: React.FC<React.PropsWithChildren<{}>> = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch: Dispatch<any> = useDispatch();

  const authProvider = useAuthProvider();

  useEffect(() => {
    dispatch(batchedLayout(authProvider));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectOrganization = (orgId: string) => {
    dispatch(batchedOrganizationSelect(orgId, true));
  };

  const provider = window.config.info.general.provider;

  const selectedOrganization = useSelector(
    (state: IState) => state.main.selectedOrganization
  );
  const organizations = useSelector(
    (state: IState) => state.entities.organizations
  );
  const catalogs = useSelector((state: IState) => state.entities.catalogs);
  const user = useSelector(getLoggedInUser);
  const firstLoadComplete = useSelector(
    (state: IState) => state.main.firstLoadComplete
  );

  // TODO(axbarsan): Remove once migrated to more granular permissions.
  const { data: permissions, isLoading: permissionsIsLoading } =
    usePermissions();
  const hasAccess = user ? hasAppAccess(user, permissions) : false;

  const supportsAppsViaMapi = user && supportsMapiApps(user, provider);
  const showApps =
    supportsAppsViaMapi || Object.keys(catalogs.items).length > 0;
  const supportsClustersViaMapi = user && supportsMapiClusters(user, provider);

  const isLoading =
    user?.type === LoggedInUserTypes.MAPI
      ? !firstLoadComplete || permissionsIsLoading
      : !firstLoadComplete;

  const selectedOrg = selectedOrganization
    ? organizations.items[selectedOrganization]
    : undefined;

  return (
    <DocumentTitle>
      <LoadingOverlay loading={isLoading}>
        {hasAccess ? (
          <>
            <Modals />
            <Navigation
              onSelectOrganization={selectOrganization}
              organizations={organizations}
              selectedOrganization={selectedOrganization}
              showApps={showApps}
              user={user}
            />
            <Breadcrumb data={{ title: 'HOME', pathname: MainRoutes.Home }}>
              <div>
                {selectedOrg && (
                  <OrganizationCreatedNote organization={selectedOrg} />
                )}
                <div className='main' data-testid='main'>
                  <Switch>
                    {supportsClustersViaMapi ? (
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

                    {user?.type === LoggedInUserTypes.MAPI ? (
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

                    {user?.type === LoggedInUserTypes.MAPI && (
                      <Route
                        component={Permissions}
                        exact
                        path={AccountSettingsRoutes.Permissions}
                      />
                    )}

                    {user?.isAdmin && (
                      <>
                        <Route
                          component={Experiments}
                          exact
                          path={AccountSettingsRoutes.Experiments.Home}
                        />
                        <Route
                          component={ClusterAppSchemaTester}
                          path={
                            AccountSettingsRoutes.Experiments
                              .ClusterAppSchemaTester
                          }
                        />
                      </>
                    )}

                    <Route
                      component={ExceptionNotificationTest}
                      exact
                      path={ExceptionNotificationTestRoutes.Home}
                    />

                    <Redirect path='*' to={MainRoutes.Home} />
                  </Switch>
                </div>
              </div>
            </Breadcrumb>
          </>
        ) : (
          <MapiUnauthorized user={user} />
        )}
      </LoadingOverlay>
    </DocumentTitle>
  );
};

export default Layout;
