import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Paragraph } from 'grommet';
import ListAppsGuide from 'MAPI/clusters/guides/ListAppsGuide';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { AppsRoutes } from 'model/constants/routes';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { selectCluster } from 'model/stores/main/actions';
import React, { useEffect, useMemo, useRef } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch } from 'react-redux';
import { useLocation, useParams } from 'react-router';
import DocumentTitle from 'shared/DocumentTitle';
import styled from 'styled-components';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import ClusterDetailAppList from './ClusterDetailAppList';
import ClusterDetailReleaseApps from './ClusterDetailReleaseApps';
import { usePermissionsForApps } from './permissions/usePermissionsForApps';
import { filterUserInstalledApps, isAppChangingVersion } from './utils';

// eslint-disable-next-line no-magic-numbers
const APP_LIST_REFRESH_INTERVAL = 60 * 1000; // 1 minute
// eslint-disable-next-line no-magic-numbers
const APP_LIST_SHORT_REFRESH_INTERVAL = 5 * 1000; // 5 seconds

const Disclaimer = styled(Paragraph)`
  line-height: 1.2;
`;

interface IClusterDetailApps {
  releaseVersion: string;
  isClusterCreating?: boolean;
}

const ClusterDetailApps: React.FC<
  React.PropsWithChildren<IClusterDetailApps>
> = ({ releaseVersion, isClusterCreating = false }) => {
  const { pathname } = useLocation();
  const { clusterId } = useParams<{ clusterId: string; orgId: string }>();

  const provider = window.config.info.general.provider;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appListClient = useRef(clientFactory());
  const appsPermissions = usePermissionsForApps(provider, clusterId);
  const appListGetOptions = { namespace: clusterId };

  const appListKey = appsPermissions.canList
    ? applicationv1alpha1.getAppListKey(appListGetOptions)
    : null;

  const {
    data: appList,
    error: appListError,
    isValidating: appListIsValidating,
  } = useSWR<applicationv1alpha1.IAppList, GenericResponseError>(
    appListKey,
    () =>
      applicationv1alpha1.getAppList(
        appListClient.current,
        auth,
        appListGetOptions
      ),
    {
      refreshInterval: (latestData) => {
        const appChangingVersion =
          latestData?.items?.find(isAppChangingVersion);

        return typeof appChangingVersion !== 'undefined'
          ? APP_LIST_SHORT_REFRESH_INTERVAL
          : APP_LIST_REFRESH_INTERVAL;
      },
    }
  );
  const appListIsLoading =
    typeof appsPermissions.canList === 'undefined' ||
    (appListIsValidating &&
      typeof appList === 'undefined' &&
      typeof appListError === 'undefined');

  useEffect(() => {
    if (appListError) {
      ErrorReporter.getInstance().notify(appListError);
    }
  }, [appListError]);

  const dispatch = useDispatch();

  const openAppCatalog = () => {
    dispatch(selectCluster(clusterId));
    dispatch(push(AppsRoutes.Home));
  };

  const userInstalledApps = useMemo(() => {
    if (typeof appList === 'undefined') {
      return [];
    }

    return filterUserInstalledApps(appList.items);
  }, [appList]);

  return (
    <DocumentTitle title={`Apps | ${clusterId}`}>
      <Breadcrumb
        data={{
          title: 'APPS',
          pathname,
        }}
      >
        <>
          <h3>Installed Apps</h3>
          <ClusterDetailAppList
            apps={userInstalledApps}
            appsPermissions={appsPermissions}
            isLoading={appListIsLoading}
            margin={{ bottom: 'large' }}
            errorMessage={extractErrorMessage(appListError)}
          >
            <Box margin={{ top: 'medium' }}>
              {appsPermissions.canCreate && (
                <Button
                  onClick={openAppCatalog}
                  disabled={appListIsLoading}
                  icon={
                    <i
                      className='fa fa-add-circle'
                      role='presentation'
                      aria-hidden='true'
                    />
                  }
                >
                  Install app
                </Button>
              )}
            </Box>
          </ClusterDetailAppList>

          <h3>Preinstalled Apps</h3>
          <Disclaimer margin={{ bottom: 'medium' }} fill={true}>
            These apps and services are preinstalled on your cluster and managed
            by Giant Swarm.
          </Disclaimer>

          <ClusterDetailReleaseApps
            appList={appList}
            isLoading={appListIsLoading}
            isClusterCreating={isClusterCreating}
            errorMessage={extractErrorMessage(appListError)}
            appsPermissions={appsPermissions}
            releaseVersion={releaseVersion}
          />

          <Box margin={{ top: 'medium' }} direction='column' gap='small'>
            <ListAppsGuide namespace={clusterId} />
          </Box>
        </>
      </Breadcrumb>
    </DocumentTitle>
  );
};

export default ClusterDetailApps;
