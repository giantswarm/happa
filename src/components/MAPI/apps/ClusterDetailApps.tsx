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
import { FlashMessageType } from 'styles';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import FlashMessageComponent from 'UI/Display/FlashMessage';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import ClusterDetailAppList from './ClusterDetailAppList';
import { usePermissionsForApps } from './permissions/usePermissionsForApps';
import {
  compareApps,
  filterDefaultApps,
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
  isClusterApp?: boolean;
  isClusterCreating?: boolean;
}

const ClusterDetailApps: React.FC<
  React.PropsWithChildren<IClusterDetailApps>
> = ({ isClusterApp, isClusterCreating = false }) => {
  const { pathname } = useLocation();
  const { clusterId, orgId } = useParams<{
    clusterId: string;
    orgId: string;
  }>();
  const provider = window.config.info.general.provider;
  const organizations = useSelector(selectOrganizations());

  const appsNamespace =
    typeof isClusterApp === 'undefined'
      ? undefined
      : isClusterApp
      ? organizations[orgId]?.namespace
      : clusterId;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appListClient = useRef(clientFactory());
  const appsPermissions = usePermissionsForApps(
    provider,
    appsNamespace ?? '',
    isClusterApp
  );
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
    isLoading: appListIsLoading,
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

  useEffect(() => {
    if (appListError) {
      ErrorReporter.getInstance().notify(appListError);
    }
  }, [appListError]);

  const isLoading =
    typeof appsPermissions.canList === 'undefined' ||
    appListIsLoading ||
    typeof appsNamespace === 'undefined';

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

  const defaultApps = useMemo(() => {
    if (typeof appList === 'undefined' || typeof isClusterApp === 'undefined') {
      return [];
    }

    const apps = filterDefaultApps(appList.items, isClusterApp, provider);

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
            isClusterApp={isClusterApp}
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

          {typeof isClusterApp !== 'undefined' && (
            <>
              <h3>{isClusterApp ? 'Default Apps' : 'Preinstalled Apps'}</h3>
              <Disclaimer margin={{ bottom: 'medium' }} fill={true}>
                {isClusterApp
                  ? `These are installed in every Giant Swarm workload cluster to provide essential functionality.`
                  : 'These apps are preinstalled on your cluster and managed by Giant Swarm.'}
              </Disclaimer>

              <ClusterDetailAppList
                apps={defaultApps}
                appList={appList}
                appsPermissions={appsPermissions}
                isLoading={isLoading}
                isClusterCreating={isClusterCreating}
                margin={{ bottom: 'medium' }}
                errorMessage={extractErrorMessage(appListError)}
                isClusterApp={isClusterApp}
              />

              {typeof appListError !== 'undefined' && (
                <FlashMessageComponent type={FlashMessageType.Danger}>
                  Unable to load the list of{' '}
                  {isClusterApp ? 'default' : 'preinstalled'} apps. Please try
                  again later or contact support: support@giantswarm.io
                </FlashMessageComponent>
              )}
            </>
          )}

          {appsNamespace && (
            <Box margin={{ top: 'medium' }} direction='column' gap='small'>
              <ListAppsGuide
                namespace={appsNamespace}
                cluster={isClusterApp ? clusterId : undefined}
              />
            </Box>
          )}
        </>
      </Breadcrumb>
    </DocumentTitle>
  );
};

export default ClusterDetailApps;
