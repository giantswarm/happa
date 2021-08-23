import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push, replace } from 'connected-react-router';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import { compare } from 'lib/semver';
import AppInstallModal from 'MAPI/apps/AppInstallModal';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { getAppCatalogEntryReadmeURL } from 'model/services/mapi/applicationv1alpha1';
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
  fetchAppCatalogEntryReadme,
  fetchAppCatalogEntryReadmeKey,
} from './utils';

function mapAppCatalogEntriesToReleasePickerItems(
  appCatalogEntries?: applicationv1alpha1.IAppCatalogEntry[]
): IVersion[] | undefined {
  if (!appCatalogEntries) return undefined;

  return appCatalogEntries
    .map((e) => ({
      chartVersion: e.spec.version,
      created: e.spec.dateCreated!,
      includesVersion: e.spec.appVersion ?? 'n/a',
      test: isTestRelease(e.spec.version),
    }))
    .sort((a, b) => compare(b.chartVersion, a.chartVersion));
}

const AppDetail: React.FC<{}> = () => {
  const match = useRouteMatch<{
    catalogName: string;
    app: string;
    version: string;
  }>();

  const { catalogName, app, version } = match.params;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appCatalogClient = useRef(clientFactory());
  const { data: appCatalog, error: appCatalogError } = useSWR<
    applicationv1alpha1.IAppCatalog,
    GenericResponse
  >(applicationv1alpha1.getAppCatalogKey('', catalogName), () =>
    applicationv1alpha1.getAppCatalog(
      appCatalogClient.current,
      auth,
      '',
      catalogName
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

  const appCatalogEntryListClient = useRef(clientFactory());

  const appCatalogEntryListGetOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions = useMemo(
    () => ({
      labelSelector: {
        matchingLabels: {
          [applicationv1alpha1.labelAppName]: app,
          [applicationv1alpha1.labelAppCatalog]: catalogName,
        },
      },
    }),
    [app, catalogName]
  );

  const { data: appCatalogEntryList, error: appCatalogEntryListError } = useSWR<
    applicationv1alpha1.IAppCatalogEntryList,
    GenericResponse
  >(
    applicationv1alpha1.getAppCatalogEntryListKey(
      appCatalogEntryListGetOptions
    ),
    () =>
      applicationv1alpha1.getAppCatalogEntryList(
        appCatalogEntryListClient.current,
        auth,
        appCatalogEntryListGetOptions
      )
  );

  useEffect(() => {
    if (appCatalogEntryListError) {
      const errorMessage = extractErrorMessage(appCatalogEntryListError);

      new FlashMessage(
        'There was a problem loading the app versions.',
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(appCatalogEntryListError);

      dispatch(push(AppsRoutes.Home));
    }
  }, [appCatalogEntryListError, dispatch]);

  const selectedClusterID = useSelector(
    (state: IState) => state.main.selectedClusterID
  );

  const selectVersion = (v: string) => {
    if (v.length < 1) return;

    const path = RoutePath.createUsablePath(AppsRoutes.AppDetail, {
      catalogName,
      app,
      version: v,
    });

    dispatch(replace(path));
  };

  const otherEntries = useMemo(
    () => mapAppCatalogEntriesToReleasePickerItems(appCatalogEntryList?.items),
    [appCatalogEntryList?.items]
  );

  const selectedEntry = useMemo(
    () => appCatalogEntryList?.items.find((a) => a.spec.version === version),
    [appCatalogEntryList?.items, version]
  );

  useEffect(() => {
    if (appCatalogEntryList && !selectedEntry) {
      new FlashMessage(
        `Couldn't find version <code>${version}</code> for <code>${app}</code>`,
        messageType.ERROR,
        messageTTL.FOREVER
      );

      dispatch(push(AppsRoutes.Home));
    }
  }, [appCatalogEntryList, selectedEntry, dispatch, version, app]);

  const appReadmeClient = useRef(clientFactory());
  const readmeURL = selectedEntry
    ? getAppCatalogEntryReadmeURL(selectedEntry)
    : undefined;

  const { data: appReadme, error: appReadmeError } = useSWR<
    string,
    GenericResponse
  >(fetchAppCatalogEntryReadmeKey(readmeURL), () =>
    fetchAppCatalogEntryReadme(appReadmeClient.current, auth, readmeURL!)
  );

  useEffect(() => {
    if (appReadmeError) {
      ErrorReporter.getInstance().notify(appReadmeError);
    }
  }, [appReadmeError]);

  const appName = selectedEntry?.spec.appName;
  let creationDate = selectedEntry?.spec.dateCreated;
  if (creationDate === null) {
    creationDate = '';
  }

  const keywords = useMemo(() => {
    if (!selectedEntry) return undefined;

    return selectedEntry.spec.chart.keywords ?? [];
  }, [selectedEntry]);

  const catalogIcon = appCatalog ? appCatalog.spec.logoURL ?? '' : undefined;

  const appIconURL = selectedEntry
    ? selectedEntry.spec.chart.icon ?? ''
    : undefined;
  const chartDescription = selectedEntry
    ? selectedEntry.spec.chart.description ?? ''
    : undefined;
  const chartWebsite = selectedEntry
    ? selectedEntry.spec.chart.home ?? ''
    : undefined;

  return (
    <DocumentTitle title={appName ? `App Details | ${appName}` : 'App Details'}>
      <Breadcrumb
        data={{
          title: appName?.toUpperCase() ?? 'Loading…',
          pathname: match.url,
        }}
      >
        <AppDetailPage
          catalogName={appCatalog?.spec.title}
          catalogIcon={catalogIcon}
          catalogDescription={appCatalog?.spec.description}
          otherVersions={otherEntries}
          appTitle={appName}
          appIconURL={appIconURL}
          chartVersion={selectedEntry?.spec.version}
          createDate={creationDate}
          includesVersion={selectedEntry?.spec.appVersion}
          description={chartDescription}
          website={chartWebsite}
          keywords={keywords}
          readmeURL={readmeURL}
          readmeError={extractErrorMessage(appReadmeError)}
          readme={appReadme}
          selectVersion={selectVersion}
          installAppModal={
            selectedEntry && otherEntries ? (
              <AppInstallModal
                appName={appName!}
                chartName={appName!}
                catalogName={appCatalog!.metadata.name}
                versions={otherEntries}
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
