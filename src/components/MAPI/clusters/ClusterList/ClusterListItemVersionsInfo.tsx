import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { ProviderCluster } from 'MAPI/types';
import { isResourceImported, isResourceManagedByGitOps } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import React, { useMemo } from 'react';
import useSWR from 'swr';
import ClusterListItemMainInfo, {
  ClusterListItemMainInfoVariant,
} from 'UI/Display/MAPI/clusters/ClusterList/ClusterListItemMainInfo';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import {
  fetchControlPlaneNodesK8sVersions,
  fetchControlPlaneNodesK8sVersionsKey,
  formatK8sVersion,
  getClusterAppVersion,
} from '../utils';

interface IClusterListItemVersionsInfoProps {
  cluster?: capiv1beta1.ICluster;
  providerCluster?: ProviderCluster;
  canListCPNodes?: boolean;
}

const ClusterListItemVersionsInfo: React.FC<
  IClusterListItemVersionsInfoProps
> = ({ cluster, providerCluster, canListCPNodes }) => {
  const clusterAppVersion = providerCluster
    ? getClusterAppVersion(providerCluster)
    : undefined;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const controlPlaneNodesK8sVersionsKey =
    cluster && canListCPNodes
      ? fetchControlPlaneNodesK8sVersionsKey(cluster)
      : null;

  const { data: k8sVersions, error: k8sVersionsError } = useSWR<
    string[],
    GenericResponseError
  >(controlPlaneNodesK8sVersionsKey, () =>
    fetchControlPlaneNodesK8sVersions(clientFactory, auth, cluster!)
  );

  const k8sVersion = useMemo(() => {
    if (!k8sVersions) return undefined;
    if (k8sVersions.length === 0 || k8sVersionsError || !canListCPNodes)
      return '';

    return formatK8sVersion(k8sVersions[0]);
  }, [k8sVersions, k8sVersionsError, canListCPNodes]);

  const isManagedByGitOps = cluster
    ? isResourceManagedByGitOps(cluster)
    : false;

  const isImported = cluster ? isResourceImported(cluster) : false;

  return (
    <ClusterListItemMainInfo
      releaseVersion={clusterAppVersion}
      k8sVersion={k8sVersion}
      variant={ClusterListItemMainInfoVariant.ClusterApp}
      isManagedByGitOps={isManagedByGitOps}
      isImported={isImported}
      cluster={cluster}
    />
  );
};

export default ClusterListItemVersionsInfo;
