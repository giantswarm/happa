import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { getDefaultAppName } from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect, useMemo, useRef } from 'react';
import { FlashMessageType } from 'styles';
import useSWR from 'swr';
import FlashMessageComponent from 'UI/Display/FlashMessage';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import ClusterDetailAppList from './ClusterDetailAppList';
import { IAppsPermissions } from './permissions/types';
import { compareApps, filterDefaultApps, removeChildApps } from './utils';

interface IClusterDetailDefaultAppsProps {
  appList?: applicationv1alpha1.IAppList;
  namespace?: string;
  isLoading: boolean;
  isClusterCreating?: boolean;
  errorMessage: string;
  appsPermissions: IAppsPermissions;
}

const ClusterDetailDefaultApps: React.FC<
  React.PropsWithChildren<IClusterDetailDefaultAppsProps>
> = ({
  appList,
  namespace,
  isLoading,
  isClusterCreating = false,
  errorMessage,
  appsPermissions,
}) => {
  const provider = window.config.info.general.provider;
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();
  const appClient = useRef(clientFactory());

  const defaultAppName = useMemo(() => {
    if (typeof appList === 'undefined') {
      return undefined;
    }

    return getDefaultAppName(appList.items, provider);
  }, [appList, provider]);

  const defaultAppKey =
    appsPermissions.canList && defaultAppName && namespace
      ? applicationv1alpha1.getAppKey(namespace, defaultAppName)
      : null;

  const {
    data: defaultApp,
    error: defaultAppError,
    isValidating: defaultAppIsValidating,
  } = useSWR<applicationv1alpha1.IApp, GenericResponseError>(
    defaultAppKey,
    () =>
      applicationv1alpha1.getApp(
        appClient.current,
        auth,
        namespace!,
        defaultAppName!
      )
  );

  const defaultAppIsLoading =
    defaultAppIsValidating &&
    typeof defaultApp === 'undefined' &&
    typeof defaultAppError === 'undefined';

  useEffect(() => {
    if (defaultAppError) {
      ErrorReporter.getInstance().notify(defaultAppError);
    }
  }, [defaultAppError]);

  const defaultApps = useMemo(() => {
    if (typeof appList === 'undefined' || typeof defaultApp === 'undefined') {
      return [];
    }

    const apps = [
      ...filterDefaultApps(appList.items, true, provider),
      defaultApp,
    ];

    return removeChildApps(apps).sort(compareApps);
  }, [appList, defaultApp, provider]);

  return (
    <>
      <ClusterDetailAppList
        apps={defaultApps}
        appList={appList}
        appsPermissions={appsPermissions}
        isLoading={isLoading || defaultAppIsLoading}
        isClusterCreating={isClusterCreating}
        margin={{ bottom: 'medium' }}
        errorMessage={errorMessage}
        isClusterApp={true}
      />
      {typeof defaultAppError !== 'undefined' && !defaultAppIsLoading && (
        <FlashMessageComponent type={FlashMessageType.Danger}>
          Unable to load the list of default apps. Please try again later or
          contact support: support@giantswarm.io
        </FlashMessageComponent>
      )}
    </>
  );
};

export default ClusterDetailDefaultApps;
