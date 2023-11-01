import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import ClusterDetailWidgetApps from 'MAPI/apps/ClusterDetailWidgetApps';
import ClusterDetailWidgetAppsLoader from 'MAPI/apps/ClusterDetailWidgetAppsLoader';
import ClusterDetailWidgetRelease from 'MAPI/releases/ClusterDetailWidgetRelease';
import { Cluster, ControlPlaneNode, ProviderCluster } from 'MAPI/types';
import {
  fetchCluster,
  fetchClusterKey,
  fetchControlPlaneNodesForCluster,
  fetchControlPlaneNodesForClusterKey,
  fetchProviderClusterForCluster,
  fetchProviderClusterForClusterKey,
  isResourceImported,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouteMatch } from 'react-router';
import styled from 'styled-components';
import useSWR from 'swr';
import CLIGuideList from 'UI/Display/MAPI/CLIGuide/CLIGuidesList';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import ClusterDetailWidgetKeyPairs from '../../keypairs/ClusterDetailWidgetKeyPairs';
import ClusterDetailWidgetWorkerNodes from '../../workernodes/ClusterDetailWidgetWorkerNodes';
import InspectClusterGuide from '../guides/InspectClusterGuide';
import InspectClusterReleaseGuide from '../guides/InspectClusterReleaseGuide';
import SetClusterLabelsGuide from '../guides/SetClusterLabelsGuide';
import UpgradeClusterGuide from '../guides/UpgradeClusterGuide';
import { usePermissionsForClusters } from '../permissions/usePermissionsForClusters';
import { usePermissionsForCPNodes } from '../permissions/usePermissionsForCPNodes';
import { hasClusterAppLabel, isReadOnlyCluster } from '../utils';
import ClusterDetailWidgetControlPlaneNodes from './ClusterDetailWidgetControlPlaneNodes';
import ClusterDetailWidgetCreated from './ClusterDetailWidgetCreated';
import ClusterDetailWidgetKubernetesAPI from './ClusterDetailWidgetKubernetesAPI';
import ClusterDetailWidgetLabels from './ClusterDetailWidgetLabels';
import ClusterDetailWidgetProvider from './ClusterDetailWidgetProvider';
import ClusterDetailWidgetVersions from './ClusterDetailWidgetVersions';
import ClusterDetailWidgetVersionsLoader from './ClusterDetailWidgetVersionsLoader';

const StyledBox = styled(Box)`
  gap: ${({ theme }) => theme.global.edgeSize.small};
`;

// eslint-disable-next-line complexity
const ClusterDetailOverview: React.FC<React.PropsWithChildren<{}>> = () => {
  const match = useRouteMatch<{ orgId: string; clusterId: string }>();
  const { orgId, clusterId } = match.params;

  const provider = window.config.info.general.provider;

  const clientFactory = useHttpClientFactory();

  const auth = useAuthProvider();

  const orgClient = useRef(clientFactory());

  const { data: org } = useSWR<
    securityv1alpha1.IOrganization,
    GenericResponseError
  >(securityv1alpha1.getOrganizationKey(orgId), () =>
    securityv1alpha1.getOrganization(orgClient.current, auth, orgId)
  );

  const namespace = org?.status?.namespace;

  const { canGet: canGetCluster, canUpdate: canUpdateCluster } =
    usePermissionsForClusters(provider, namespace ?? '');

  const clusterKey =
    canGetCluster && namespace
      ? fetchClusterKey(provider, namespace, clusterId)
      : null;

  // The error is handled in the parent component.
  const { data: cluster } = useSWR<Cluster, GenericResponseError>(
    clusterKey,
    () => fetchCluster(clientFactory, auth, provider, namespace!, clusterId)
  );

  const providerClusterKey = cluster
    ? fetchProviderClusterForClusterKey(cluster)
    : null;

  const { data: providerCluster, error: providerClusterError } = useSWR<
    ProviderCluster,
    GenericResponseError
  >(providerClusterKey, () =>
    fetchProviderClusterForCluster(clientFactory, auth, cluster!)
  );

  useEffect(() => {
    if (providerClusterError) {
      ErrorReporter.getInstance().notify(providerClusterError);
    }
  }, [providerClusterError]);

  const { canList: canListCPNodes } = usePermissionsForCPNodes(
    provider,
    cluster?.metadata.namespace ?? ''
  );

  const controlPlaneNodesKey =
    cluster && canListCPNodes
      ? fetchControlPlaneNodesForClusterKey(cluster)
      : null;

  const { data: controlPlaneNodes, error: controlPlaneNodesError } = useSWR<
    ControlPlaneNode[],
    GenericResponseError
  >(controlPlaneNodesKey, () =>
    fetchControlPlaneNodesForCluster(clientFactory, auth, cluster!)
  );

  useEffect(() => {
    if (controlPlaneNodesError) {
      ErrorReporter.getInstance().notify(controlPlaneNodesError);
    }
  }, [controlPlaneNodesError]);

  const isClusterApp = cluster ? hasClusterAppLabel(cluster) : undefined;
  const isClusterImported = cluster ? isResourceImported(cluster) : undefined;

  const clusterVersion = useMemo(() => {
    if (!cluster) return undefined;

    return isClusterApp
      ? capiv1beta1.getClusterAppVersion(cluster)
      : capiv1beta1.getReleaseVersion(cluster);
  }, [cluster, isClusterApp]);

  const [targetReleaseVersion, setTargetReleaseVersion] = useState('');

  const isReadOnly = cluster && isReadOnlyCluster(cluster);

  return (
    <StyledBox wrap={true} direction='row'>
      <ClusterDetailWidgetWorkerNodes
        cluster={cluster}
        basis='425px'
        flex={{ grow: 1, shrink: 1 }}
      />
      {typeof isClusterApp === 'undefined' ? (
        <ClusterDetailWidgetAppsLoader />
      ) : (
        <ClusterDetailWidgetApps
          basis='425px'
          flex={{ grow: 1, shrink: 1 }}
          isClusterApp={isClusterApp}
        />
      )}
      <ClusterDetailWidgetKeyPairs
        basis='200px'
        flex={{ grow: 1, shrink: 1 }}
      />
      {typeof cluster === 'undefined' ? (
        <ClusterDetailWidgetVersionsLoader basis='100%' />
      ) : isClusterApp || isClusterImported ? (
        <ClusterDetailWidgetVersions cluster={cluster} basis='100%' />
      ) : (
        <ClusterDetailWidgetRelease
          cluster={cluster}
          providerCluster={providerCluster}
          canUpdateCluster={canUpdateCluster}
          onTargetReleaseVersionChange={setTargetReleaseVersion}
          basis='100%'
        />
      )}
      <ClusterDetailWidgetLabels
        cluster={cluster}
        canUpdateCluster={canUpdateCluster}
        basis='100%'
      />
      <ClusterDetailWidgetControlPlaneNodes
        cluster={cluster}
        providerCluster={providerCluster}
        basis='100%'
      />
      <ClusterDetailWidgetKubernetesAPI cluster={cluster} basis='100%' />
      <ClusterDetailWidgetProvider
        cluster={cluster}
        providerCluster={providerCluster}
        controlPlaneNodes={controlPlaneNodes}
        basis='100%'
      />
      <ClusterDetailWidgetCreated cluster={cluster} basis='100%' />

      {cluster && (
        <CLIGuideList
          fill
          margin={{ top: 'large' }}
          animation={{ type: 'fadeIn', duration: 300 }}
        >
          <InspectClusterGuide
            provider={provider}
            clusterName={cluster.metadata.name}
            clusterNamespace={cluster.metadata.namespace!}
          />
          {!isClusterApp && clusterVersion && (
            <InspectClusterReleaseGuide
              clusterName={cluster.metadata.name}
              clusterNamespace={cluster.metadata.namespace!}
              releaseVersion={clusterVersion}
            />
          )}
          {targetReleaseVersion && (
            <UpgradeClusterGuide
              provider={provider}
              clusterName={cluster.metadata.name}
              clusterNamespace={cluster.metadata.namespace!}
              targetReleaseVersion={targetReleaseVersion}
              canUpdateCluster={canUpdateCluster}
            />
          )}
          {cluster && !isReadOnly && (
            <SetClusterLabelsGuide
              clusterName={cluster.metadata.name}
              clusterNamespace={cluster.metadata.namespace!}
              provider={provider}
              canUpdateCluster={canUpdateCluster}
            />
          )}
        </CLIGuideList>
      )}
    </StyledBox>
  );
};

export default ClusterDetailOverview;
