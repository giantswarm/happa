import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import * as releasesUtils from 'MAPI/releases/utils';
import { extractErrorMessage, getClusterReleaseVersion } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import {
  getIsImpersonatingNonAdmin,
  getUserIsAdmin,
} from 'model/stores/main/selectors';
import { isPreRelease } from 'model/stores/releases/utils';
import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import InputGroup from 'UI/Inputs/InputGroup';
import { getK8sVersionEOLDate } from 'utils/config';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClient } from 'utils/hooks/useHttpClient';

import CreateClusterReleaseSelector, {
  IRelease,
} from './CreateClusterReleaseSelector';
import { IClusterPropertyProps, withClusterReleaseVersion } from './patches';

interface ICreateClusterReleaseProps
  extends IClusterPropertyProps,
    Omit<React.ComponentPropsWithoutRef<typeof InputGroup>, 'onChange' | 'id'> {
  orgNamespace: string;
}

const CreateClusterRelease: React.FC<
  React.PropsWithChildren<ICreateClusterReleaseProps>
> = ({ id, cluster, onChange, orgNamespace, ...props }) => {
  const isAdmin = useSelector(getUserIsAdmin);
  const isImpersonatingNonAdmin = useSelector(getIsImpersonatingNonAdmin);

  const releaseListClient = useHttpClient();
  const auth = useAuthProvider();

  const {
    data: releaseList,
    error: releaseListError,
    isLoading: releaseListIsLoading,
  } = useSWR<releasev1alpha1.IReleaseList, GenericResponseError>(
    releasev1alpha1.getReleaseListKey(),
    () => releasev1alpha1.getReleaseList(releaseListClient, auth)
  );

  useEffect(() => {
    if (releaseListError) {
      ErrorReporter.getInstance().notify(releaseListError);
    }
  }, [releaseListError]);

  const releases = useMemo(() => {
    if (!releaseList) return {};

    return releaseList.items.reduce(
      (acc: Record<string, IRelease>, curr: releasev1alpha1.IRelease) => {
        const isActive = curr.spec.state === 'active';
        const isPreview = curr.spec.state === 'preview';
        const normalizedVersion = curr.metadata.name.slice(1);

        if (
          !isPreview &&
          (!isAdmin || (isAdmin && isImpersonatingNonAdmin)) &&
          (!isActive || isPreRelease(normalizedVersion))
        ) {
          return acc;
        }

        const components = releasesUtils.reduceReleaseToComponents(curr);

        const k8sVersion = releasev1alpha1.getK8sVersion(curr);
        const k8sVersionEOLDate = k8sVersion
          ? getK8sVersionEOLDate(k8sVersion) ?? undefined
          : undefined;

        acc[normalizedVersion] = {
          version: normalizedVersion,
          state: curr.spec.state,
          timestamp: curr.metadata.creationTimestamp ?? '',
          components: Object.values(components),
          kubernetesVersion: k8sVersion,
          k8sVersionEOLDate: k8sVersionEOLDate,
          releaseNotesURL: releasev1alpha1.getReleaseNotesURL(curr),
        };

        return acc;
      },
      {}
    );
  }, [isAdmin, isImpersonatingNonAdmin, releaseList]);

  const handleChange = (
    release: string,
    releaseComponents: IReleaseComponent[]
  ) => {
    onChange({
      isValid: true,
      patch: withClusterReleaseVersion(
        release,
        releaseComponents,
        orgNamespace
      ),
    });
  };

  const value = getClusterReleaseVersion(cluster) ?? '';

  return (
    <InputGroup label='Release version' {...props}>
      <CreateClusterReleaseSelector
        releases={releases}
        isAdmin={isAdmin && !isImpersonatingNonAdmin}
        errorMessage={extractErrorMessage(releaseListError)}
        isLoading={releaseListIsLoading}
        selectRelease={handleChange}
        selectedRelease={value}
      />
    </InputGroup>
  );
};

export default CreateClusterRelease;
