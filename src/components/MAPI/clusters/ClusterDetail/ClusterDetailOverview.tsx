import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import ClusterDetailWidgetApps from 'MAPI/apps/ClusterDetailWidgetApps';
import ClusterDetailWidgetRelease from 'MAPI/releases/ClusterDetailWidgetRelease';
import {
  fetchProviderClusterForCluster,
  fetchProviderClusterForClusterKey,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import React, { useEffect, useRef } from 'react';
import { useRouteMatch } from 'react-router';
import styled from 'styled-components';
import useSWR from 'swr';

import ClusterDetailWidgetKeyPairs from '../../keypairs/ClusterDetailWidgetKeyPairs';
import ClusterDetailWidgetWorkerNodes from '../../workernodes/ClusterDetailWidgetWorkerNodes';
import InspectClusterGuide from '../guides/InspectClusterGuide';
import InspectClusterReleaseGuide from '../guides/InspectClusterReleaseGuide';
import SetClusterLabelsGuide from '../guides/SetClusterLabelsGuide';
import ClusterDetailWidgetControlPlaneNodes from './ClusterDetailWidgetControlPlaneNodes';
import ClusterDetailWidgetCreated from './ClusterDetailWidgetCreated';
import ClusterDetailWidgetKubernetesAPI from './ClusterDetailWidgetKubernetesAPI';
import ClusterDetailWidgetLabels from './ClusterDetailWidgetLabels';
import ClusterDetailWidgetProvider from './ClusterDetailWidgetProvider';

const StyledBox = styled(Box)`
  gap: ${({ theme }) => theme.global.edgeSize.small};
`;

const ClusterDetailOverview: React.FC<{}> = () => {
  const match = useRouteMatch<{ orgId: string; clusterId: string }>();
  const { orgId, clusterId } = match.params;

  const clientFactory = useHttpClientFactory();

  const auth = useAuthProvider();

  const clusterClient = useRef(clientFactory());
  const orgClient = useRef(clientFactory());

  const { data: org } = useSWR<
    securityv1alpha1.IOrganization,
    GenericResponseError
  >(securityv1alpha1.getOrganizationKey(orgId), () =>
    securityv1alpha1.getOrganization(orgClient.current, auth, orgId)
  );

  const namespace = org?.status?.namespace;

  const clusterKey = namespace
    ? capiv1alpha3.getClusterKey(namespace, clusterId)
    : null;

  // The error is handled in the parent component.
  const { data: cluster } = useSWR<capiv1alpha3.ICluster, GenericResponseError>(
    clusterKey,
    () =>
      capiv1alpha3.getCluster(
        clusterClient.current,
        auth,
        namespace!,
        clusterId
      )
  );

  const providerClusterKey = cluster
    ? fetchProviderClusterForClusterKey(cluster)
    : null;

  const { data: providerCluster, error: providerClusterError } = useSWR(
    providerClusterKey,
    () => fetchProviderClusterForCluster(clientFactory, auth, cluster!)
  );

  useEffect(() => {
    if (providerClusterError) {
      ErrorReporter.getInstance().notify(providerClusterError);
    }
  }, [providerClusterError]);

  const provider = window.config.info.general.provider;
  const releaseVersion = cluster
    ? capiv1alpha3.getReleaseVersion(cluster)
    : undefined;

  return (
    <StyledBox wrap={true} direction='row'>
      <ClusterDetailWidgetWorkerNodes
        cluster={cluster}
        basis='425px'
        flex={{ grow: 1, shrink: 1 }}
      />
      <ClusterDetailWidgetApps basis='425px' flex={{ grow: 1, shrink: 1 }} />
      <ClusterDetailWidgetKeyPairs
        basis='200px'
        flex={{ grow: 1, shrink: 1 }}
      />
      <ClusterDetailWidgetRelease cluster={cluster} basis='100%' />
      <ClusterDetailWidgetLabels cluster={cluster} basis='100%' />
      <ClusterDetailWidgetControlPlaneNodes cluster={cluster} basis='100%' />
      <ClusterDetailWidgetKubernetesAPI cluster={cluster} basis='100%' />
      <ClusterDetailWidgetProvider
        cluster={cluster}
        providerCluster={providerCluster}
        basis='100%'
      />
      <ClusterDetailWidgetCreated cluster={cluster} basis='100%' />

      {cluster && (
        <Box
          margin={{ top: 'large' }}
          direction='column'
          gap='small'
          basis='100%'
          animation={{ type: 'fadeIn', duration: 300 }}
        >
          <InspectClusterGuide
            provider={provider}
            clusterName={cluster.metadata.name}
            clusterNamespace={cluster.metadata.namespace!}
          />

          {releaseVersion && (
            <InspectClusterReleaseGuide
              clusterName={cluster.metadata.name}
              clusterNamespace={cluster.metadata.namespace!}
              releaseVersion={releaseVersion}
            />
          )}

          <SetClusterLabelsGuide
            clusterName={cluster.metadata.name}
            clusterNamespace={cluster.metadata.namespace!}
          />
        </Box>
      )}
    </StyledBox>
  );
};

export default ClusterDetailOverview;
