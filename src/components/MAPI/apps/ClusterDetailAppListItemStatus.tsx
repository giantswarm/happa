import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClient } from 'utils/hooks/useHttpClient';

import {
  getLatestVersionForApp,
  isAppChangingVersion,
  normalizeAppVersion,
} from './utils';

interface IClusterDetailAppListItemStatusProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  app: applicationv1alpha1.IApp;
  catalogNamespace?: string | null;
  canListAppCatalogEntries?: boolean;
}

const ClusterDetailAppListItemStatus: React.FC<
  IClusterDetailAppListItemStatusProps
> = ({ app, catalogNamespace, canListAppCatalogEntries, ...props }) => {
  const auth = useAuthProvider();
  const appCatalogEntryListClient = useHttpClient();

  const appCatalogEntryListGetOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions =
    useMemo(() => {
      return {
        labelSelector: {
          matchingLabels: {
            [applicationv1alpha1.labelAppName]: app.spec.name,
            [applicationv1alpha1.labelAppCatalog]: app.spec.catalog,
          },
        },
        namespace: catalogNamespace ?? undefined,
      };
    }, [app.spec.catalog, app.spec.name, catalogNamespace]);

  const getAppCatalogEntryListKey = canListAppCatalogEntries
    ? applicationv1alpha1.getAppCatalogEntryListKey(
        appCatalogEntryListGetOptions
      )
    : null;

  const { data: appCatalogEntryList, error: appCatalogEntryListError } = useSWR<
    applicationv1alpha1.IAppCatalogEntryList,
    GenericResponseError
  >(getAppCatalogEntryListKey, () =>
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

  const isChangingVersion = isAppChangingVersion(app);
  const hasNewVersion = useMemo(() => {
    if (!appCatalogEntryList || isChangingVersion) return false;

    const latestVersion = getLatestVersionForApp(
      appCatalogEntryList.items,
      app.spec.name
    );

    return (
      latestVersion && latestVersion !== normalizeAppVersion(app.spec.version)
    );
  }, [app, appCatalogEntryList, isChangingVersion]);

  return (
    <Box {...props}>
      {isChangingVersion && (
        <Text color='status-warning' size='small'>
          <i
            className='fa fa-version-upgrade'
            role='presentation'
            aria-hidden='true'
          />{' '}
          Switching to {normalizeAppVersion(app.spec.version)}
        </Text>
      )}

      {hasNewVersion && (
        <Text color='status-warning' size='small'>
          <i className='fa fa-warning' role='presentation' aria-hidden='true' />{' '}
          Upgrade available
        </Text>
      )}
    </Box>
  );
};

export default ClusterDetailAppListItemStatus;
