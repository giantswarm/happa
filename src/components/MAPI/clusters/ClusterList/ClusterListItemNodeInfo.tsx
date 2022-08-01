import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { NodePoolList } from 'MAPI/types';
import {
  extractErrorMessage,
  fetchNodePoolListForCluster,
  fetchNodePoolListForClusterKey,
  fetchProviderNodePoolsForNodePools,
  fetchProviderNodePoolsForNodePoolsKey,
  getMachineTypes,
  IProviderNodePoolForNodePoolName,
} from 'MAPI/utils';
import { usePermissionsForNodePools } from 'MAPI/workernodes/permissions/usePermissionsForNodePools';
import { mapNodePoolsToProviderNodePools } from 'MAPI/workernodes/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import React, { useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import ClusterListItemNodeInfoUI from 'UI/Display/MAPI/clusters/ClusterList/ClusterListItemNodeInfo';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import {
  getWorkerNodesCount,
  getWorkerNodesCPU,
  getWorkerNodesMemory,
} from '../utils';

interface IClusterListItemNodeInfoProps {
  cluster?: capiv1beta1.ICluster;
}

const ClusterListItemNodeInfo: React.FC<IClusterListItemNodeInfoProps> = ({
  cluster,
}) => {
  const provider = window.config.info.general.provider;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const { canList: canListNodePools, canGet: canGetNodePools } =
    usePermissionsForNodePools(provider, cluster?.metadata.namespace ?? '');

  const hasReadPermissionsForNodePools = canListNodePools && canGetNodePools;

  const nodePoolListForClusterKey =
    hasReadPermissionsForNodePools && cluster
      ? fetchNodePoolListForClusterKey(cluster, cluster.metadata.namespace)
      : null;

  const { data: nodePoolList, error: nodePoolListError } = useSWR<
    NodePoolList,
    GenericResponseError
  >(nodePoolListForClusterKey, () =>
    fetchNodePoolListForCluster(
      clientFactory,
      auth,
      cluster,
      cluster!.metadata.namespace
    )
  );

  useEffect(() => {
    if (nodePoolListError) {
      ErrorReporter.getInstance().notify(nodePoolListError);
    }
  }, [nodePoolListError]);

  const { data: providerNodePools, error: providerNodePoolsError } = useSWR<
    IProviderNodePoolForNodePoolName[],
    GenericResponseError
  >(fetchProviderNodePoolsForNodePoolsKey(nodePoolList?.items), () =>
    fetchProviderNodePoolsForNodePools(clientFactory, auth, nodePoolList!.items)
  );

  useEffect(() => {
    if (providerNodePoolsError) {
      ErrorReporter.getInstance().notify(providerNodePoolsError);
    }
  }, [providerNodePoolsError]);

  const machineTypes = useRef(getMachineTypes());

  const nodePoolsWithProviderNodePools = useMemo(() => {
    if (!nodePoolList?.items || !providerNodePools) return undefined;

    return mapNodePoolsToProviderNodePools(
      nodePoolList.items,
      providerNodePools
    );
  }, [nodePoolList?.items, providerNodePools]);

  const workerNodesCPU =
    providerNodePoolsError || !hasReadPermissionsForNodePools
      ? -1
      : getWorkerNodesCPU(nodePoolsWithProviderNodePools, machineTypes.current);
  const workerNodesMemory =
    providerNodePoolsError || !hasReadPermissionsForNodePools
      ? -1
      : getWorkerNodesMemory(
          nodePoolsWithProviderNodePools,
          machineTypes.current
        );

  const workerNodePoolsCount = hasReadPermissionsForNodePools
    ? nodePoolList?.items.length
    : -1;
  const workerNodesCount = hasReadPermissionsForNodePools
    ? getWorkerNodesCount(nodePoolList?.items)
    : -1;

  return nodePoolListError ? (
    <Box direction='row' align='center'>
      <Text
        color='status-critical'
        aria-label='Cluster load error'
        margin={{ top: 'xxsmall' }}
      >
        {extractErrorMessage(nodePoolListError)}
      </Text>
    </Box>
  ) : (
    <ClusterListItemNodeInfoUI
      workerNodePoolsCount={workerNodePoolsCount}
      workerNodesCPU={workerNodesCPU}
      workerNodesCount={workerNodesCount}
      workerNodesMemory={workerNodesMemory}
    />
  );
};

export default ClusterListItemNodeInfo;
