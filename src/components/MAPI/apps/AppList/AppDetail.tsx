import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import { compare } from 'lib/semver';
import AppInstallModal from 'MAPI/apps/AppInstallModal';
import { extractErrorMessage } from 'MAPI/organizations/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect, useMemo, useRef } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { AppsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { IState } from 'stores/state';
import useSWR from 'swr';
import AppDetailPage from 'UI/Display/Apps/AppDetailNew/AppDetailPage';

import { isTestRelease } from '../utils';
import {
  getAppCatalogsIndexAppList,
  getAppCatalogsIndexAppListKey,
  IAppCatalogIndexAppList,
} from './utils';

const AppDetail: React.FC<{}> = () => {
  const match = useRouteMatch<{
    catalogName: string;
    app: string;
    version: string;
  }>();

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appCatalogClient = useRef(clientFactory());
  const {
    data: appCatalog,
    error: appCatalogError,
    // isValidating: appCatalogIsValidating,
  } = useSWR<applicationv1alpha1.IAppCatalog, GenericResponse>(
    applicationv1alpha1.getAppCatalogKey('', match.params.catalogName),
    () =>
      applicationv1alpha1.getAppCatalog(
        appCatalogClient.current,
        auth,
        '',
        match.params.catalogName
      )
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (appCatalogError) {
      const errorMessage = extractErrorMessage(appCatalogError);

      new FlashMessage(
        'There was a problem loading the app catalog.',
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(appCatalogError);

      dispatch(push(AppsRoutes.Home));
    }
  }, [appCatalogError, dispatch]);

  // const appCatalogIsLoading =
  //   typeof appCatalog === 'undefined' && appCatalogIsValidating;

  const appCatalogList = appCatalog ? [appCatalog] : undefined;

  const {
    data: appCatalogIndexAppList,
    error: appCatalogIndexAppListError,
    // isValidating: appCatalogIndexAppListIsValidating,
  } = useSWR<IAppCatalogIndexAppList, GenericResponse>(
    getAppCatalogsIndexAppListKey(appCatalogList),
    // TODO(axbarsan): Find a more elegant solution for passing `fetch` here.
    () => getAppCatalogsIndexAppList(fetch, auth, appCatalogList!)
  );

  useEffect(() => {
    if (appCatalogIndexAppListError) {
      // TODO(axbarsan): Display this error in the UI.

      ErrorReporter.getInstance().notify(appCatalogIndexAppListError);

      dispatch(push(AppsRoutes.Home));
    }
  }, [appCatalogIndexAppListError, dispatch]);

  // TODO(axbarsan): Add loading animation using this.
  // const appCatalogIndexListIsLoading =
  //   appCatalogIsLoading ||
  //   (typeof appCatalogIndexAppList === 'undefined' &&
  //     appCatalogIndexAppListIsValidating);

  const app = useMemo(() => {
    return appCatalogIndexAppList?.items.find(
      (a) => a.name === match.params.app
    );
  }, [appCatalogIndexAppList, match.params.app]);

  // TODO(axbarsan): Fetch app readme.
  const readme = '';
  const readmeURL = '';
  const readmeError = '';

  const selectedClusterID = useSelector(
    (state: IState) => state.main.selectedClusterID
  );

  const selectVersion = (v: string) => {
    if (v.length > 0 && app) {
      const path = RoutePath.createUsablePath(AppsRoutes.AppDetail, {
        catalogName: app.catalogName,
        app: app.name,
        version: v,
      });

      dispatch(push(path));
    }
  };

  const otherVersions = useMemo(() => {
    if (!app) return [];

    return app.versions
      .map((e) => ({
        chartVersion: e.version,
        created: e.created,
        includesVersion: e.appVersion,
        test: isTestRelease(e.version),
      }))
      .sort((a, b) => compare(b.chartVersion, a.chartVersion));
  }, [app]);

  if (!app) return null;

  // TODO(axbarsan): Check if this exists.
  const latestVersion = app.versions[0];

  return (
    <DocumentTitle title={`App Details | ${app.name}`}>
      <Breadcrumb
        data={{
          title: app.name.toUpperCase(),
          pathname: match.url,
        }}
      >
        {app && (
          <AppDetailPage
            appTitle={app.name}
            appIconURL={app.appIconURL}
            catalogName={app.catalogName}
            catalogDescription={appCatalog!.spec.description}
            catalogIcon={app.catalogIconUrl}
            otherVersions={otherVersions}
            chartVersion={latestVersion.version}
            createDate={latestVersion.created}
            includesVersion={latestVersion.appVersion}
            description={latestVersion.description ?? ''}
            website={latestVersion.home}
            keywords={latestVersion.keywords}
            readmeURL={readmeURL}
            readmeError={readmeError}
            readme={readme}
            selectVersion={selectVersion}
            installAppModal={
              <AppInstallModal
                appName={app.name}
                chartName={latestVersion.name}
                catalogName={app.catalogName}
                versions={otherVersions}
                selectedClusterID={selectedClusterID}
              />
            }
          />
        )}
      </Breadcrumb>
    </DocumentTitle>
  );
};

export default AppDetail;
