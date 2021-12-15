import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { AppsRoutes } from 'model/constants/routes';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR, { useSWRConfig } from 'swr';
import ClusterDetailCounter from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailCounter';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { usePermissionsForApps } from './permissions/usePermissionsForApps';
import {
  computeAppsCategorizedCounters,
  filterUserInstalledApps,
  getUpgradableApps,
  getUpgradableAppsKey,
} from './utils';

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.global.colors['input-highlight']};
`;

interface IClusterDetailWidgetAppsProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {}

const ClusterDetailWidgetApps: React.FC<IClusterDetailWidgetAppsProps> = (
  props
) => {
  const { clusterId } = useParams<{ clusterId: string; orgId: string }>();

  const provider = window.config.info.general.provider;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appListClient = useRef(clientFactory());

  const { canList: canListApps } = usePermissionsForApps(provider, clusterId);

  const appListGetOptions = { namespace: clusterId };
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

  const userInstalledApps = useMemo(() => {
    if (!appList) return [];

    return filterUserInstalledApps(appList.items, true);
  }, [appList]);

  const appCounters = useMemo(() => {
    if (appListError) {
      return {
        apps: -1,
        uniqueApps: -1,
        deployed: -1,
      };
    }

    if (!appList) {
      return {
        apps: undefined,
        uniqueApps: undefined,
        deployed: undefined,
      };
    }

    return computeAppsCategorizedCounters(userInstalledApps);
  }, [appList, appListError, userInstalledApps]);

  const hasNoApps =
    typeof appCounters.apps === 'number' && appCounters.apps === 0;

  const { cache } = useSWRConfig();

  const upgradableAppsKey = appList
    ? getUpgradableAppsKey(userInstalledApps)
    : null;

  const { data: upgradableApps, error: upgradableAppsError } = useSWR<
    string[],
    GenericResponseError
  >(upgradableAppsKey, () =>
    getUpgradableApps(clientFactory, auth, cache, userInstalledApps)
  );

  useEffect(() => {
    if (upgradableAppsError) {
      ErrorReporter.getInstance().notify(upgradableAppsError);
    }
  }, [upgradableAppsError]);

  const upgradableAppsCount = useMemo(() => {
    if (!upgradableApps) return undefined;
    if (upgradableAppsError) return -1;

    return upgradableApps.length;
  }, [upgradableApps, upgradableAppsError]);

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
          <Text size='small'>
            To find apps to install, browse our{' '}
            <StyledLink to={AppsRoutes.Home}>apps</StyledLink>.
          </Text>
        </Box>
      )}

      {!hasNoApps && (
        <>
          <ClusterDetailCounter
            label='app'
            pluralize={true}
            value={appCounters.apps}
          />
          <ClusterDetailCounter
            label='unique app'
            pluralize={true}
            value={appCounters.uniqueApps}
          />
          <ClusterDetailCounter label='deployed' value={appCounters.deployed} />
          <ClusterDetailCounter
            label='upgradable'
            value={upgradableAppsCount}
          />
        </>
      )}
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetApps;
