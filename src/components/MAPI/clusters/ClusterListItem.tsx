import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import { extractErrorMessage } from 'MAPI/organizations/utils';
import {
  fetchNodePoolListForCluster,
  fetchNodePoolListForClusterKey,
  fetchProviderNodePoolsForNodePools,
  fetchProviderNodePoolsForNodePoolsKey,
  getMachineTypes,
} from 'MAPI/utils';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import PropTypes from 'prop-types';
import React, { useMemo, useRef } from 'react';
import { OrganizationsRoutes } from 'shared/constants/routes';
import useSWR from 'swr';
import UIClusterListItem from 'UI/Display/MAPI/clusters/ClusterListItem';

import {
  formatReleaseVersion,
  getK8sVersion,
  getWorkerNodesCount,
  getWorkerNodesCPU,
  getWorkerNodesMemory,
} from './utils';

interface IClusterListItemProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  cluster: capiv1alpha3.ICluster;
}

const ClusterListItem: React.FC<IClusterListItemProps> = ({
  cluster,
  ...props
}) => {
  const name = cluster.metadata.name;
  const description = capiv1alpha3.getClusterDescription(cluster);
  const releaseVersion = capiv1alpha3.getReleaseVersion(cluster);
  const organization = capiv1alpha3.getClusterOrganization(cluster);

  const clusterPath = useMemo(() => {
    if (!organization) return '';

    return RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: organization,
        clusterId: name,
      }
    );
  }, [organization, name]);

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const formattedReleaseVersion = formatReleaseVersion(cluster);
  const releaseKey = formattedReleaseVersion
    ? releasev1alpha1.getReleaseKey(formattedReleaseVersion)
    : null;
  const releaseClient = useRef(clientFactory());
  const { data: release, error: releaseError } = useSWR(releaseKey, () =>
    releasev1alpha1.getRelease(
      releaseClient.current,
      auth,
      formattedReleaseVersion!
    )
  );

  const k8sVersion = getK8sVersion(release, releaseError);

  const {
    data: nodePoolList,
    error: nodePoolListError,
  } = useSWR(fetchNodePoolListForClusterKey(cluster), () =>
    fetchNodePoolListForCluster(clientFactory, auth, cluster)
  );

  const {
    data: providerNodePools,
    error: providerNodePoolsError,
  } = useSWR(fetchProviderNodePoolsForNodePoolsKey(nodePoolList?.items), () =>
    fetchProviderNodePoolsForNodePools(clientFactory, auth, nodePoolList!.items)
  );

  const workerNodesError = nodePoolListError || providerNodePoolsError;

  const machineTypes = useRef(getMachineTypes());

  return (
    <UIClusterListItem
      href={clusterPath}
      name={name}
      namespace={cluster.metadata.namespace!}
      description={description}
      creationDate={cluster.metadata.creationTimestamp ?? ''}
      deletionDate={cluster.metadata.deletionTimestamp ?? null}
      releaseVersion={releaseVersion ?? ''}
      k8sVersion={k8sVersion}
      workerNodePoolsCount={nodePoolList?.items.length}
      workerNodesCount={getWorkerNodesCount(nodePoolList?.items)}
      workerNodesCPU={getWorkerNodesCPU(
        nodePoolList?.items,
        providerNodePools,
        machineTypes.current
      )}
      workerNodesMemory={getWorkerNodesMemory(
        nodePoolList?.items,
        providerNodePools,
        machineTypes.current
      )}
      workerNodesError={extractErrorMessage(workerNodesError)}
      {...props}
    />
  );
};

ClusterListItem.propTypes = {
  // @ts-expect-error
  cluster: PropTypes.object.isRequired,
};

export default ClusterListItem;
