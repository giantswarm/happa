import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { NodePoolList } from 'MAPI/types';
import {
  fetchNodePoolListForCluster,
  fetchNodePoolListForClusterKey,
  fetchProviderNodePoolsForNodePools,
  fetchProviderNodePoolsForNodePoolsKey,
  getMachineTypes,
  IProviderNodePoolForNodePoolName,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { OrganizationsRoutes } from 'model/constants/routes';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ClusterDetailCounter from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailCounter';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import RoutePath from 'utils/routePath';

import {
  getWorkerNodesCount,
  getWorkerNodesCPU,
  getWorkerNodesMemory,
} from '../clusters/utils';
import { usePermissionsForNodePools } from './permissions/usePermissionsForNodePools';
import { mapNodePoolsToProviderNodePools } from './utils';

function formatMemory(value?: number) {
  if (typeof value === 'undefined') return undefined;

  // eslint-disable-next-line no-magic-numbers
  return Math.round(value);
}

function formatCPU(value?: number) {
  if (typeof value === 'undefined') return undefined;

  return Math.round(value);
}

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.global.colors['input-highlight']};
`;

interface IClusterDetailWidgetWorkerNodesProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1alpha3.ICluster;
}

const ClusterDetailWidgetWorkerNodes: React.FC<
  IClusterDetailWidgetWorkerNodesProps
  // eslint-disable-next-line complexity
> = ({ cluster, ...props }) => {
  const { clusterId, orgId } = useParams<{
    clusterId: string;
    orgId: string;
  }>();

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const provider = window.config.info.general.provider;

  const { canList, canGet, canCreate } = usePermissionsForNodePools(
    provider,
    cluster?.metadata.namespace ?? ''
  );

  const hasReadPermissionsForNp = canList && canGet;

  const nodePoolListForClusterKey =
    cluster && hasReadPermissionsForNp
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

  const nodePoolsError = nodePoolListError ?? providerNodePoolsError;
  const insufficientPermissionsForNp = cluster && !hasReadPermissionsForNp;

  const workerNodePoolsCount =
    nodePoolListError || insufficientPermissionsForNp
      ? -1
      : nodePoolList?.items.length;
  const workerNodesCount =
    nodePoolsError || insufficientPermissionsForNp
      ? -1
      : getWorkerNodesCount(nodePoolList?.items);

  const nodePoolsWithProviderNodePools = useMemo(() => {
    if (!nodePoolList?.items || !providerNodePools) return undefined;

    return mapNodePoolsToProviderNodePools(
      nodePoolList.items,
      providerNodePools
    );
  }, [nodePoolList?.items, providerNodePools]);

  const workerNodesCPU =
    nodePoolsError || insufficientPermissionsForNp
      ? -1
      : getWorkerNodesCPU(nodePoolsWithProviderNodePools, machineTypes.current);
  const workerNodesMemory =
    nodePoolsError || insufficientPermissionsForNp
      ? -1
      : getWorkerNodesMemory(
          nodePoolsWithProviderNodePools,
          machineTypes.current
        );

  const hasNoNodePools =
    typeof workerNodePoolsCount === 'number' && workerNodePoolsCount === 0;

  const workerNodesPath = useMemo(
    () =>
      RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.Detail.WorkerNodes,
        { orgId, clusterId }
      ),
    [clusterId, orgId]
  );

  return (
    <ClusterDetailWidget
      title='Worker nodes'
      contentProps={{
        direction: 'row',
        gap: 'small',
        wrap: true,
        justify: 'around',
      }}
      {...props}
    >
      {hasNoNodePools && (
        <Box
          fill={true}
          direction='row'
          pad={{ bottom: 'xsmall', right: 'xsmall' }}
          justify='between'
          align={canCreate ? 'end' : 'start'}
        >
          <Box>
            <Text margin={{ bottom: 'small' }}>No node pools</Text>
            {canCreate && (
              <Text size='small'>Create node pools to run workloads.</Text>
            )}
          </Box>
          {canCreate && (
            <StyledLink
              to={{
                pathname: workerNodesPath,
                state: { hasNoNodePools: true },
              }}
            >
              <Button
                icon={
                  <i
                    className='fa fa-add-circle'
                    role='presentation'
                    aria-hidden='true'
                  />
                }
                tabIndex={-1}
              >
                Add node pool
              </Button>
            </StyledLink>
          )}
        </Box>
      )}

      {!hasNoNodePools && (
        <>
          <ClusterDetailCounter
            label='node pool'
            pluralize={true}
            value={workerNodePoolsCount}
          />
          <ClusterDetailCounter
            label='node'
            pluralize={true}
            value={workerNodesCount}
          />
          <ClusterDetailCounter
            label='CPU'
            pluralize={true}
            value={formatCPU(workerNodesCPU)}
          />
          <ClusterDetailCounter
            label='GB RAM'
            value={formatMemory(workerNodesMemory)}
          />
        </>
      )}
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetWorkerNodes;
