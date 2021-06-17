import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppsRoutes } from 'shared/constants/routes';
import styled from 'styled-components';
import useSWR from 'swr';
import ClusterDetailCounter from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailCounter';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';

import {
  computeAppsCategorizedCounters,
  filterUserInstalledApps,
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

  const appListClient = useHttpClient();
  const auth = useAuthProvider();

  const appListGetOptions = { namespace: clusterId };
  const { data: appList, error: appListError } = useSWR<
    applicationv1alpha1.IAppList,
    GenericResponseError
  >(applicationv1alpha1.getAppListKey(appListGetOptions), () =>
    applicationv1alpha1.getAppList(appListClient, auth, appListGetOptions)
  );

  useEffect(() => {
    if (appListError) {
      ErrorReporter.getInstance().notify(appListError);
    }
  }, [appListError]);

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

    const userInstalledApps = filterUserInstalledApps(appList.items, true);

    return computeAppsCategorizedCounters(userInstalledApps);
  }, [appList, appListError]);

  const hasNoApps =
    typeof appCounters.apps === 'number' && appCounters.apps === 0;

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
        </>
      )}
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetApps.propTypes = {};

export default ClusterDetailWidgetApps;
