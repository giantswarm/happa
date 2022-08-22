import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { usePermissionsForReleases } from 'MAPI/releases/permissions/usePermissionsForReleases';
import { supportsReleases } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import React, { useEffect, useMemo, useRef } from 'react';
import { FlashMessageType } from 'styles';
import useSWR from 'swr';
import FlashMessageComponent from 'UI/Display/FlashMessage';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import ClusterDetailAppList from './ClusterDetailAppList';
import { IAppsPermissions } from './permissions/types';
import { mapDefaultApps } from './utils';

interface IClusterDetailReleaseAppsProps {
  appList?: applicationv1alpha1.IAppList;
  isLoading: boolean;
  isClusterCreating?: boolean;
  errorMessage: string;
  appsPermissions: IAppsPermissions;
  releaseVersion: string;
}

const ClusterDetailReleaseApps: React.FC<
  React.PropsWithChildren<IClusterDetailReleaseAppsProps>
> = ({
  appList,
  isLoading,
  isClusterCreating = false,
  errorMessage,
  appsPermissions,
  releaseVersion,
}) => {
  const provider = window.config.info.general.provider;
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const releaseClient = useRef(clientFactory());
  const { canGet: canGetReleases } = usePermissionsForReleases(
    provider,
    'default'
  );

  const isReleasesSupportedByProvider = supportsReleases(provider);
  const releaseKey =
    canGetReleases && isReleasesSupportedByProvider
      ? releasev1alpha1.getReleaseKey(releaseVersion)
      : null;

  const {
    data: release,
    error: releaseError,
    isValidating: releaseIsValidating,
  } = useSWR<releasev1alpha1.IRelease, GenericResponseError>(releaseKey, () =>
    releasev1alpha1.getRelease(
      releaseClient.current,
      auth,
      `v${releaseVersion}`
    )
  );

  const releaseIsLoading =
    releaseIsValidating &&
    typeof release === 'undefined' &&
    typeof releaseError === 'undefined';

  useEffect(() => {
    if (releaseError) {
      ErrorReporter.getInstance().notify(releaseError);
    }
  }, [releaseError]);

  const preInstalledApps = useMemo(() => {
    if (typeof release === 'undefined' || typeof appList === 'undefined') {
      return [];
    }

    return mapDefaultApps(release, appList.items);
  }, [release, appList]);

  return (
    <>
      <ClusterDetailAppList
        apps={preInstalledApps}
        appsPermissions={appsPermissions}
        isLoading={isLoading || releaseIsLoading}
        isClusterCreating={isClusterCreating}
        margin={{ bottom: 'medium' }}
        errorMessage={errorMessage}
      />
      {typeof releaseError !== 'undefined' && !releaseIsLoading && (
        <FlashMessageComponent type={FlashMessageType.Danger}>
          Unable to load the list of preinstalled apps. Please try again later
          or contact support: support@giantswarm.io
        </FlashMessageComponent>
      )}
    </>
  );
};

export default ClusterDetailReleaseApps;
