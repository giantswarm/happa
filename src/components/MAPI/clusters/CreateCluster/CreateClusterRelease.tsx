import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import ReleaseSelector, {
  IRelease,
} from 'Cluster/NewCluster/ReleaseSelector/ReleaseSelector';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { extractErrorMessage } from 'MAPI/organizations/utils';
import * as releasesUtils from 'MAPI/releases/utils';
import { Cluster } from 'MAPI/types';
import { getClusterReleaseVersion } from 'MAPI/utils';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getUserIsAdmin } from 'stores/main/selectors';
import { isPreRelease } from 'stores/releases/utils';
import useSWR from 'swr';
import InputGroup from 'UI/Inputs/InputGroup';

import { IClusterPropertyProps, withClusterReleaseVersion } from './patches';

interface ICreateClusterReleaseProps
  extends IClusterPropertyProps,
    Omit<
      React.ComponentPropsWithoutRef<typeof InputGroup>,
      'onChange' | 'id'
    > {}

const CreateClusterRelease: React.FC<ICreateClusterReleaseProps> = ({
  id,
  cluster,
  onChange,
  ...props
}) => {
  const isAdmin = useSelector(getUserIsAdmin);

  const releaseListClient = useHttpClient();
  const auth = useAuthProvider();

  const {
    data: releaseList,
    error: releaseListError,
    isValidating: releaseIsValidating,
  } = useSWR(releasev1alpha1.getReleaseListKey(), () =>
    releasev1alpha1.getReleaseList(releaseListClient, auth)
  );

  useEffect(() => {
    if (releaseListError) {
      ErrorReporter.getInstance().notify(releaseListError);
    }
  }, [releaseListError]);

  const releaseIsLoading =
    releaseIsValidating &&
    typeof releaseList === 'undefined' &&
    typeof releaseListError === 'undefined';

  const releases = useMemo(() => {
    if (!releaseList) return {};

    return releaseList.items.reduce(
      (acc: Record<string, IRelease>, curr: releasev1alpha1.IRelease) => {
        const isActive = curr.spec.state === 'active';
        const normalizedVersion = curr.metadata.name.slice(1);

        if (!isAdmin && (!isActive || isPreRelease(normalizedVersion))) {
          return acc;
        }

        const components = releasesUtils.reduceReleaseToComponents(curr);

        acc[normalizedVersion] = {
          version: normalizedVersion,
          active: isActive,
          timestamp: curr.metadata.creationTimestamp ?? '',
          components: Object.values(components),
          kubernetesVersion: releasev1alpha1.getK8sVersion(curr),
          releaseNotesURL: releasev1alpha1.getReleaseNotesURL(curr),
        };

        return acc;
      },
      {}
    );
  }, [isAdmin, releaseList]);

  const handleChange = (newVersion: string) => {
    onChange({
      isValid: true,
      patch: withClusterReleaseVersion(newVersion),
    });
  };

  const value = getClusterReleaseVersion(cluster) ?? '';

  return (
    <InputGroup label='Release version' {...props}>
      <ReleaseSelector
        releases={releases}
        isAdmin={isAdmin}
        errorMessage={extractErrorMessage(releaseListError)}
        isLoading={releaseIsLoading}
        selectRelease={handleChange}
        selectedRelease={value}
        autoSelectLatest={false}
      />
    </InputGroup>
  );
};

CreateClusterRelease.propTypes = {
  id: PropTypes.string.isRequired,
  cluster: (PropTypes.object as PropTypes.Requireable<Cluster>).isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
};

export default CreateClusterRelease;
