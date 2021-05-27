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
import { IVersion } from 'UI/Controls/VersionPicker/VersionPickerUtils';
import AppDetailPage from 'UI/Display/Apps/AppDetailNew/AppDetailPage';

import { isTestRelease } from '../utils';
import {
  fetchAppCatalogIndexAppVersionReadme,
  fetchAppCatalogIndexAppVersionReadmeKey,
  getAppCatalogIndexAppVersionReadmeURL,
  getAppCatalogsIndexAppList,
  getAppCatalogsIndexAppListKey,
  IAppCatalogIndexAppList,
  IAppCatalogIndexAppVersion,
} from './utils';

function mapAppCatalogIndexAppVersionsToReleasePickerItems(
  appVersions?: IAppCatalogIndexAppVersion[]
): IVersion[] | undefined {
  if (!appVersions) return undefined;

  return appVersions
    .map((e) => ({
      chartVersion: e.version,
      created: e.created,
      includesVersion: e.appVersion ?? 'n/a',
      test: isTestRelease(e.version),
    }))
    .sort((a, b) => compare(b.chartVersion, a.chartVersion));
}

const AppDetail: React.FC<{}> = () => {
  const match = useRouteMatch<{
    catalogName: string;
    app: string;
    version: string;
  }>();

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appCatalogClient = useRef(clientFactory());
  const { data: appCatalog, error: appCatalogError } = useSWR<
    applicationv1alpha1.IAppCatalog,
    GenericResponse
  >(applicationv1alpha1.getAppCatalogKey('', match.params.catalogName), () =>
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

  const appCatalogList = appCatalog ? [appCatalog] : undefined;

  const {
    data: appCatalogIndexAppList,
    error: appCatalogIndexAppListError,
  } = useSWR<IAppCatalogIndexAppList, GenericResponse>(
    getAppCatalogsIndexAppListKey(appCatalogList),
    // TODO(axbarsan): Find a more elegant solution for passing `fetch` here.
    () => getAppCatalogsIndexAppList(fetch, auth, appCatalogList!)
  );

  useEffect(() => {
    if (appCatalogIndexAppListError) {
      const errorMessage = extractErrorMessage(appCatalogIndexAppListError);

      new FlashMessage(
        'There was a problem loading the app catalog index.',
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(appCatalogIndexAppListError);

      dispatch(push(AppsRoutes.Home));
    }
  }, [appCatalogIndexAppListError, dispatch]);

  const app = useMemo(() => {
    return appCatalogIndexAppList?.items.find(
      (a) => a.name === match.params.app
    );
  }, [appCatalogIndexAppList, match.params.app]);

  const selectedClusterID = useSelector(
    (state: IState) => state.main.selectedClusterID
  );

  const selectVersion = (v: string) => {
    if (v.length < 1 || !app) return;

    const path = RoutePath.createUsablePath(AppsRoutes.AppDetail, {
      catalogName: app.catalogName,
      app: app.name,
      version: v,
    });

    dispatch(push(path));
  };

  const otherVersions = useMemo(
    () => mapAppCatalogIndexAppVersionsToReleasePickerItems(app?.versions),
    [app]
  );

  const selectedVersion = useMemo(
    () => app?.versions?.find((a) => a.version === match.params.version),
    [app, match.params.version]
  );

  useEffect(() => {
    if (app && !selectedVersion) {
      new FlashMessage(
        `Couldn't find version <code>${match.params.version}</code> for <code>${match.params.app}</code>`,
        messageType.ERROR,
        messageTTL.FOREVER
      );

      dispatch(push(AppsRoutes.Home));
    }
  }, [app, selectedVersion, match.params, dispatch]);

  const readmeURL = getAppCatalogIndexAppVersionReadmeURL(selectedVersion);

  const { data: appReadme, error: appReadmeError } = useSWR<
    string,
    GenericResponse
  >(fetchAppCatalogIndexAppVersionReadmeKey(readmeURL), () =>
    // TODO(axbarsan): Find a more elegant solution for passing `fetch` here.
    fetchAppCatalogIndexAppVersionReadme(fetch, auth, readmeURL!)
  );

  useEffect(() => {
    if (appReadmeError) {
      ErrorReporter.getInstance().notify(appReadmeError);
    }
  }, [appReadmeError]);

  return (
    <DocumentTitle title={app && `App Details | ${app.name}`}>
      <Breadcrumb
        data={{
          title: app?.name.toUpperCase() ?? 'Loading…',
          pathname: match.url,
        }}
      >
        <AppDetailPage
          catalogName={appCatalog?.spec.title}
          catalogIcon={appCatalog?.spec.logoURL}
          catalogDescription={appCatalog?.spec.description}
          otherVersions={otherVersions}
          appTitle={selectedVersion?.name}
          appIconURL={selectedVersion?.icon}
          chartVersion={selectedVersion?.version}
          createDate={selectedVersion?.created}
          includesVersion={selectedVersion?.appVersion}
          description={selectedVersion?.description}
          website={selectedVersion?.home}
          keywords={selectedVersion?.keywords}
          readmeURL={readmeURL}
          readmeError={extractErrorMessage(appReadmeError)}
          readme={appReadme}
          selectVersion={selectVersion}
          installAppModal={
            selectedVersion && otherVersions ? (
              <AppInstallModal
                appName={selectedVersion.name}
                chartName={selectedVersion.name}
                catalogName={appCatalog!.metadata.name}
                versions={otherVersions}
                selectedClusterID={selectedClusterID}
              />
            ) : undefined
          }
        />
      </Breadcrumb>
    </DocumentTitle>
  );
};

export default AppDetail;
