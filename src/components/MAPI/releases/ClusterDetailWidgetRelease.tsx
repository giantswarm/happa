import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import useSWR from 'swr';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import ClusterDetailWidgetOptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidgetOptionalValue';
import NotAvailable from 'UI/Display/NotAvailable';

const StyledDot = styled(Dot)`
  padding: 0;
`;

interface IClusterDetailWidgetReleaseProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1alpha3.ICluster;
}

const ClusterDetailWidgetRelease: React.FC<IClusterDetailWidgetReleaseProps> = ({
  cluster,
  ...props
}) => {
  const releaseListClient = useHttpClient();
  const auth = useAuthProvider();

  const {
    data: releaseList,
    error: releaseListError,
  } = useSWR(releasev1alpha1.getReleaseListKey(), () =>
    releasev1alpha1.getReleaseList(releaseListClient, auth)
  );

  useEffect(() => {
    if (releaseListError) {
      ErrorReporter.getInstance().notify(releaseListError);
    }
  }, [releaseListError]);

  const releaseVersion = cluster
    ? capiv1alpha3.getReleaseVersion(cluster)
    : undefined;

  const k8sVersion = useMemo(() => {
    const formattedReleaseVersion = `v${releaseVersion}`;

    const release = releaseList?.items.find(
      (r) => r.metadata.name === formattedReleaseVersion
    );
    if (!release) return undefined;

    const version = releasev1alpha1.getK8sVersion(release);
    if (typeof version === 'undefined') return '';

    return version;
  }, [releaseList?.items, releaseVersion]);

  return (
    <ClusterDetailWidget
      title='Release'
      inline={true}
      contentProps={{
        direction: 'row',
        gap: 'xsmall',
        wrap: true,
        align: 'center',
      }}
      {...props}
    >
      <ClusterDetailWidgetOptionalValue
        value={releaseVersion}
        replaceEmptyValue={false}
      >
        {(value) => (
          <Text aria-label={`Cluster release version ${value}`}>
            <i
              className='fa fa-version-tag'
              role='presentation'
              aria-hidden='true'
            />{' '}
            {value || <NotAvailable />}
          </Text>
        )}
      </ClusterDetailWidgetOptionalValue>
      <StyledDot />
      <ClusterDetailWidgetOptionalValue
        value={k8sVersion}
        replaceEmptyValue={false}
      >
        {(value) => (
          <KubernetesVersionLabel
            hidePatchVersion={false}
            version={value as string}
          />
        )}
      </ClusterDetailWidgetOptionalValue>
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetRelease.propTypes = {
  cluster: PropTypes.object as PropTypes.Requireable<capiv1alpha3.ICluster>,
};

export default ClusterDetailWidgetRelease;
