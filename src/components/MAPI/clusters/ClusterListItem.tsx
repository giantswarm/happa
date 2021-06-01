import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
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
import React, { useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { getProvider, getUserIsAdmin } from 'stores/main/selectors';
import useSWR from 'swr';
import UIClusterListItem from 'UI/Display/MAPI/clusters/ClusterListItem';

import ClusterListItemStatus from './ClusterListItemStatus';
import {
  getWorkerNodesCount,
  getWorkerNodesCPU,
  getWorkerNodesMemory,
} from './utils';

interface IClusterListItemProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  cluster?: capiv1alpha3.ICluster;
  releases?: releasev1alpha1.IRelease[];
}

const ClusterListItem: React.FC<IClusterListItemProps> = ({
  cluster,
  releases,
  ...props
}) => {
  const name = cluster?.metadata.name;
  const description = cluster
    ? capiv1alpha3.getClusterDescription(cluster)
    : undefined;
  const releaseVersion = cluster
    ? capiv1alpha3.getReleaseVersion(cluster)
    : undefined;
  const organization = cluster
    ? capiv1alpha3.getClusterOrganization(cluster)
    : undefined;

  const clusterPath = useMemo(() => {
    if (!organization || !name) return '';

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

  const k8sVersion = useMemo(() => {
    const formattedReleaseVersion = `v${releaseVersion}`;

    const release = releases?.find(
      (r) => r.metadata.name === formattedReleaseVersion
    );
    if (!release) return undefined;

    const version = releasev1alpha1.getK8sVersion(release);
    if (typeof version === 'undefined') return '';

    return version;
  }, [releases, releaseVersion]);

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

  const machineTypes = useRef(getMachineTypes());

  const workerNodesCPU = providerNodePoolsError
    ? -1
    : getWorkerNodesCPU(
        nodePoolList?.items,
        providerNodePools,
        machineTypes.current
      );
  const workerNodesMemory = providerNodePoolsError
    ? -1
    : getWorkerNodesMemory(
        nodePoolList?.items,
        providerNodePools,
        machineTypes.current
      );

  const dispatch = useDispatch();

  const handleGetStartedClick = useCallback(() => {
    if (!organization || !name) return;

    const path = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.GettingStarted.Overview,
      {
        orgId: organization,
        clusterId: name,
      }
    );

    dispatch(push(path));
  }, [dispatch, name, organization]);

  const isAdmin = useSelector(getUserIsAdmin);
  const provider = useSelector(getProvider);

  return (
    <UIClusterListItem
      href={clusterPath}
      name={name}
      namespace={cluster?.metadata.namespace}
      description={description}
      creationDate={cluster?.metadata.creationTimestamp}
      deletionDate={cluster?.metadata.deletionTimestamp ?? null}
      releaseVersion={releaseVersion}
      k8sVersion={k8sVersion}
      workerNodePoolsCount={nodePoolList?.items.length}
      workerNodesCount={getWorkerNodesCount(nodePoolList?.items)}
      workerNodesCPU={workerNodesCPU}
      workerNodesMemory={workerNodesMemory}
      workerNodesError={extractErrorMessage(nodePoolListError)}
      onGetStartedClick={handleGetStartedClick}
      additionalTitle={
        cluster && (
          <ClusterListItemStatus
            cluster={cluster}
            provider={provider}
            isAdmin={isAdmin}
            releases={releases}
          />
        )
      }
      {...props}
    />
  );
};

ClusterListItem.propTypes = {
  cluster: PropTypes.object as PropTypes.Requireable<capiv1alpha3.ICluster>,
  releases: PropTypes.array,
};

export default ClusterListItem;
