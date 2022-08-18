import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Text } from 'grommet';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import Truncated from 'UI/Util/Truncated';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClient } from 'utils/hooks/useHttpClient';

import {
  hasNewerVersionForApp,
  isAppChangingVersion,
  normalizeAppVersion,
} from './utils';

interface IClusterDetailAppListWidgetVersionProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
  catalogNamespace?: string | null;
  canListAppCatalogEntries?: boolean;
  displayUpgradableStatus?: boolean;
  displayUpstreamVersion?: boolean;
}

const ClusterDetailAppListWidgetVersion: React.FC<
  React.PropsWithChildren<IClusterDetailAppListWidgetVersionProps>
> = ({
  app,
  catalogNamespace,
  canListAppCatalogEntries,
  displayUpgradableStatus = true,
  displayUpstreamVersion = false,
  ...props
}) => {
  const auth = useAuthProvider();
  const appCatalogEntryListClient = useHttpClient();

  const appCatalogEntryListGetOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions =
    useMemo(() => {
      if (!app) return {};

      return {
        labelSelector: {
          matchingLabels: {
            [applicationv1alpha1.labelAppName]: app.spec.name,
            [applicationv1alpha1.labelAppCatalog]: app.spec.catalog,
          },
        },
        namespace: catalogNamespace ?? undefined,
      };
    }, [app, catalogNamespace]);
  const appCatalogEntryListKey = useMemo(() => {
    if (!app || !canListAppCatalogEntries || !displayUpgradableStatus)
      return null;

    return applicationv1alpha1.getAppCatalogEntryListKey(
      appCatalogEntryListGetOptions
    );
  }, [
    app,
    appCatalogEntryListGetOptions,
    canListAppCatalogEntries,
    displayUpgradableStatus,
  ]);

  const { data: appCatalogEntryList, error: appCatalogEntryListError } = useSWR<
    applicationv1alpha1.IAppCatalogEntryList,
    GenericResponseError
  >(appCatalogEntryListKey, () =>
    applicationv1alpha1.getAppCatalogEntryList(
      appCatalogEntryListClient,
      auth,
      appCatalogEntryListGetOptions
    )
  );

  useEffect(() => {
    if (appCatalogEntryListError) {
      const errorMessage = extractErrorMessage(appCatalogEntryListError);

      new FlashMessage(
        'There was a problem loading app versions.',
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(appCatalogEntryListError);
    }
  }, [appCatalogEntryListError]);

  const currentVersion = app
    ? normalizeAppVersion(
        displayUpstreamVersion
          ? applicationv1alpha1.getAppUpstreamVersion(app)
          : applicationv1alpha1.getAppCurrentVersion(app)
      )
    : undefined;

  const isChangingVersion = app ? isAppChangingVersion(app) : false;
  const hasNewVersion = useMemo(() => {
    if (!appCatalogEntryList || !app || isChangingVersion) return false;

    return hasNewerVersionForApp(appCatalogEntryList.items, app);
  }, [app, appCatalogEntryList, isChangingVersion]);

  return (
    <ClusterDetailAppListWidget
      title={displayUpstreamVersion ? 'Upstream version' : 'Version'}
      titleColor='text'
      contentProps={{
        direction: 'row',
        gap: 'small',
        wrap: true,
        align: 'baseline',
      }}
      {...props}
    >
      <OptionalValue value={currentVersion} loaderWidth={100}>
        {(value) => (
          <Truncated
            as={Text}
            aria-label={
              displayUpstreamVersion
                ? `App upstream version: ${value}`
                : `App version: ${value}`
            }
            numStart={10}
          >
            {value}
          </Truncated>
        )}
      </OptionalValue>

      {isChangingVersion && !displayUpstreamVersion && (
        <Text color='status-warning'>
          <i
            className='fa fa-version-upgrade'
            role='presentation'
            aria-hidden='true'
          />{' '}
          Switching to {app?.spec.version}
        </Text>
      )}

      {hasNewVersion && !displayUpstreamVersion && (
        <Text color='status-warning'>
          <i className='fa fa-warning' role='presentation' aria-hidden='true' />{' '}
          Upgrade available
        </Text>
      )}
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetVersion;
