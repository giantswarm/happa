import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Paragraph } from 'grommet';
import ListAppsGuide from 'MAPI/clusters/guides/ListAppsGuide';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { AppsRoutes } from 'model/constants/routes';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { selectCluster } from 'model/stores/main/actions';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect, useMemo, useRef } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router';
import DocumentTitle from 'shared/DocumentTitle';
import styled from 'styled-components';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import ClusterDetailAppList from './ClusterDetailAppList';
import ClusterDetailDefaultApps from './ClusterDetailDefaultApps';
import ClusterDetailReleaseApps from './ClusterDetailReleaseApps';
import { usePermissionsForApps } from './permissions/usePermissionsForApps';
import {
  compareApps,
  filterUserInstalledApps,
  isAppChangingVersion,
  removeChildApps,
} from './utils';

// eslint-disable-next-line no-magic-numbers
const APP_LIST_REFRESH_INTERVAL = 60 * 1000; // 1 minute
// eslint-disable-next-line no-magic-numbers
const APP_LIST_SHORT_REFRESH_INTERVAL = 5 * 1000; // 5 seconds

const Disclaimer = styled(Paragraph)`
  line-height: 1.2;
`;

interface IClusterDetailApps {
  clusterVersion?: string;
  isClusterApp?: boolean;
  isClusterCreating?: boolean;
}

const ClusterDetailApps: React.FC<
  React.PropsWithChildren<IClusterDetailApps>
> = ({ clusterVersion, isClusterApp, isClusterCreating = false }) => {
  const { pathname } = useLocation();
  const { clusterId, orgId } = useParams<{
    clusterId: string;
    orgId: string;
  }>();
  const provider = window.config.info.general.provider;
  const providerName = 'Google Cloud Platform';
  const organizations = useSelector(selectOrganizations());

  const appsNamespace =
    typeof isClusterApp === 'undefined'
      ? undefined
      : isClusterApp
      ? organizations[orgId].namespace
      : clusterId;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appListClient = useRef(clientFactory());
  const appsPermissions = usePermissionsForApps(provider, clusterId);
  const appListGetOptions =
    typeof isClusterApp === 'undefined'
      ? undefined
      : isClusterApp
      ? {
          namespace: appsNamespace,
          labelSelector: {
            matchingLabels: {
              [applicationv1alpha1.labelCluster]: clusterId,
            },
          },
        }
      : { namespace: appsNamespace };

  const appListKey =
    appsPermissions.canList && typeof appListGetOptions !== 'undefined'
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

  const isLoading = appListIsLoading || typeof appsNamespace === 'undefined';

  const dispatch = useDispatch();

  const openAppCatalog = () => {
    dispatch(selectCluster(clusterId));
    dispatch(push(AppsRoutes.Home));
  };

  const userInstalledApps = useMemo(() => {
    if (typeof appList === 'undefined' || typeof isClusterApp === 'undefined') {
      return [];
    }

    const apps = filterUserInstalledApps(appList.items, isClusterApp, provider);

    return removeChildApps(apps).sort(compareApps);
  }, [appList, isClusterApp, provider]);

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
            appList={appList}
            canBeModified={true}
            appsPermissions={appsPermissions}
            isLoading={isLoading}
            margin={{ bottom: 'large' }}
            errorMessage={extractErrorMessage(appListError)}
          >
            <Box margin={{ top: 'medium' }}>
              {appsPermissions.canCreate && (
                <Button
                  onClick={openAppCatalog}
                  disabled={isLoading}
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

          {typeof isClusterApp !== 'undefined' &&
            typeof clusterVersion !== 'undefined' && (
              <>
                <h3>{isClusterApp ? 'Default Apps' : 'Preinstalled Apps'}</h3>
                <Disclaimer margin={{ bottom: 'medium' }} fill={true}>
                  {isClusterApp
                    ? `These are installed in every Giant Swarm workload cluster on ${providerName}, to provide essential functionality.`
                    : 'These apps are preinstalled on your cluster and managed by Giant Swarm.'}
                </Disclaimer>

                {isClusterApp ? (
                  <ClusterDetailDefaultApps
                    appList={appList}
                    namespace={appsNamespace}
                    isLoading={isLoading}
                    isClusterCreating={isClusterCreating}
                    errorMessage={extractErrorMessage(appListError)}
                    appsPermissions={appsPermissions}
                  />
                ) : (
                  <ClusterDetailReleaseApps
                    appList={appList}
                    isLoading={isLoading}
                    isClusterCreating={isClusterCreating}
                    errorMessage={extractErrorMessage(appListError)}
                    appsPermissions={appsPermissions}
                    releaseVersion={clusterVersion}
                  />
                )}
              </>
            )}

          {appsNamespace && (
            <Box margin={{ top: 'medium' }} direction='column' gap='small'>
              <ListAppsGuide namespace={appsNamespace} />
            </Box>
          )}
        </>
      </Breadcrumb>
    </DocumentTitle>
  );
};

export default ClusterDetailApps;
