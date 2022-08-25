import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { AppsRoutes } from 'model/constants/routes';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR, { useSWRConfig } from 'swr';
import ClusterDetailCounter from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailCounter';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { usePermissionsForAppCatalogEntries } from './permissions/usePermissionsForAppCatalogEntries';
import { usePermissionsForApps } from './permissions/usePermissionsForApps';
import { usePermissionsForCatalogs } from './permissions/usePermissionsForCatalogs';
import {
  computeAppsCategorizedCounters,
  filterUserInstalledApps,
  getUpgradableApps,
  getUpgradableAppsKey,
  removeChildApps,
} from './utils';

const StyledLink = styled(Link)`
  color: ${({ theme }) => normalizeColor('input-highlight', theme)};
`;

interface IClusterDetailWidgetAppsProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  isClusterApp: boolean;
}

const ClusterDetailWidgetApps: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetAppsProps>
> = ({ isClusterApp, ...props }) => {
  const { clusterId, orgId } = useParams<{
    clusterId: string;
    orgId: string;
  }>();

  const provider = window.config.info.general.provider;
  const organizations = useSelector(selectOrganizations());

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appListClient = useRef(clientFactory());

  const { canList: canListApps, canCreate: canCreateApps } =
    usePermissionsForApps(provider, clusterId);

  const appsNamespace = isClusterApp
    ? organizations[orgId]?.namespace
    : clusterId;

  const appListGetOptions = isClusterApp
    ? {
        namespace: appsNamespace,
        labelSelector: {
          matchingLabels: {
            [applicationv1alpha1.labelCluster]: clusterId,
          },
        },
      }
    : { namespace: appsNamespace };

  const appListKey = canListApps
    ? applicationv1alpha1.getAppListKey(appListGetOptions)
    : null;

  const { data: appList, error: appListError } = useSWR<
    applicationv1alpha1.IAppList,
    GenericResponseError
  >(appListKey, () =>
    applicationv1alpha1.getAppList(
      appListClient.current,
      auth,
      appListGetOptions
    )
  );

  useEffect(() => {
    if (appListError) {
      ErrorReporter.getInstance().notify(appListError);
    }
  }, [appListError]);

  const appClient = useRef(clientFactory());

  const defaultAppName = useMemo(() => {
    if (typeof appList === 'undefined') {
      return undefined;
    }

    return applicationv1alpha1.getDefaultAppName(appList.items, provider);
  }, [appList, provider]);

  const defaultAppKey =
    canListApps && defaultAppName && appsNamespace
      ? applicationv1alpha1.getAppKey(appsNamespace, defaultAppName)
      : null;

  const { data: defaultApp, error: defaultAppError } = useSWR<
    applicationv1alpha1.IApp,
    GenericResponseError
  >(defaultAppKey, () =>
    applicationv1alpha1.getApp(
      appClient.current,
      auth,
      appsNamespace!,
      defaultAppName!
    )
  );

  useEffect(() => {
    if (defaultAppError) {
      ErrorReporter.getInstance().notify(defaultAppError);
    }
  }, [defaultAppError]);

  const userInstalledApps = useMemo(() => {
    if (typeof appList === 'undefined') {
      return undefined;
    }

    const apps = filterUserInstalledApps(appList.items, isClusterApp, provider);

    return removeChildApps(apps);
  }, [appList, isClusterApp, provider]);

  const insufficientPermissionsForApps = canListApps === false;

  const appCounters = useMemo(() => {
    if (appListError || insufficientPermissionsForApps) {
      return {
        apps: -1,
        notDeployed: -1,
      };
    }
    if (typeof appList === 'undefined') {
      return {
        apps: undefined,
        notDeployed: undefined,
      };
    }

    if (isClusterApp && typeof defaultApp === 'undefined') {
      return {
        apps: undefined,
        notDeployed: undefined,
      };
    }

    const apps = isClusterApp ? [...appList.items, defaultApp!] : appList.items;

    return computeAppsCategorizedCounters(apps);
  }, [
    appList,
    appListError,
    insufficientPermissionsForApps,
    isClusterApp,
    defaultApp,
  ]);

  const hasNoApps =
    typeof appCounters.apps === 'number' && appCounters.apps === 0;

  const { canList: canListCatalogs } = usePermissionsForCatalogs(
    provider,
    'default'
  );
  const { canList: canListAppCatalogEntries } =
    usePermissionsForAppCatalogEntries(provider, 'default');

  const canReadCatalogResources = canListCatalogs && canListAppCatalogEntries;

  const upgradableAppsKey =
    canReadCatalogResources && userInstalledApps
      ? getUpgradableAppsKey(userInstalledApps)
      : null;

  const { cache } = useSWRConfig();

  const { data: upgradableApps, error: upgradableAppsError } = useSWR<
    string[],
    GenericResponseError
  >(upgradableAppsKey, () =>
    getUpgradableApps(clientFactory, auth, cache, userInstalledApps!)
  );

  useEffect(() => {
    if (upgradableAppsError) {
      ErrorReporter.getInstance().notify(upgradableAppsError);
    }
  }, [upgradableAppsError]);

  const upgradableAppsCount = useMemo(() => {
    if (
      upgradableAppsError ||
      !canReadCatalogResources ||
      insufficientPermissionsForApps
    )
      return -1;

    if (userInstalledApps && userInstalledApps.length === 0) return 0;

    if (!upgradableApps) return undefined;

    return upgradableApps.length;
  }, [
    upgradableAppsError,
    canReadCatalogResources,
    insufficientPermissionsForApps,
    upgradableApps,
    userInstalledApps,
  ]);

  return (
    <ClusterDetailWidget
      title='Apps'
      contentProps={{
        direction: 'row',
        gap: 'small',
        wrap: true,
        justify: 'around',
      }}
      {...props}
    >
      {hasNoApps && (
        <Box fill={true} pad={{ bottom: 'xsmall' }}>
          <Text margin={{ bottom: 'small' }}>No apps installed</Text>
          {canCreateApps && canReadCatalogResources && (
            <Text size='small'>
              To find apps to install, browse our{' '}
              <StyledLink to={AppsRoutes.Home}>apps</StyledLink>.
            </Text>
          )}
        </Box>
      )}

      {!hasNoApps && (
        <>
          <ClusterDetailCounter
            label='app resource'
            pluralize={true}
            value={appCounters.apps}
          />
          <ClusterDetailCounter
            label='not deployed'
            value={appCounters.notDeployed}
            color={
              appCounters.notDeployed === -1
                ? 'text'
                : appCounters.notDeployed === 0
                ? 'text-success'
                : 'text-warning'
            }
          />
          <ClusterDetailCounter
            label={
              upgradableAppsCount === 1
                ? 'upgrade available'
                : 'upgrades available'
            }
            value={upgradableAppsCount}
            color={
              upgradableAppsCount === -1
                ? 'text'
                : upgradableAppsCount === 0
                ? 'text-success'
                : 'text-warning'
            }
          />
        </>
      )}
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetApps;
