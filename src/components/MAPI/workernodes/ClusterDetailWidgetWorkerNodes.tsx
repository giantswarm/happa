import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import {
  fetchNodePoolListForCluster,
  fetchNodePoolListForClusterKey,
  fetchProviderNodePoolsForNodePools,
  fetchProviderNodePoolsForNodePoolsKey,
  getMachineTypes,
} from 'MAPI/utils';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';
import styled from 'styled-components';
import useSWR from 'swr';
import ClusterDetailCounter from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailCounter';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';

import {
  getWorkerNodesCount,
  getWorkerNodesCPU,
  getWorkerNodesMemory,
} from '../clusters/utils';

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

const ClusterDetailWidgetWorkerNodes: React.FC<IClusterDetailWidgetWorkerNodesProps> = ({
  cluster,
  ...props
}) => {
  const { clusterId, orgId } = useParams<{
    clusterId: string;
    orgId: string;
  }>();

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const {
    data: nodePoolList,
    error: nodePoolListError,
  } = useSWR(fetchNodePoolListForClusterKey(cluster), () =>
    fetchNodePoolListForCluster(clientFactory, auth, cluster)
  );

  useEffect(() => {
    if (nodePoolListError) {
      ErrorReporter.getInstance().notify(nodePoolListError);
    }
  }, [nodePoolListError]);

  const {
    data: providerNodePools,
    error: providerNodePoolsError,
  } = useSWR(fetchProviderNodePoolsForNodePoolsKey(nodePoolList?.items), () =>
    fetchProviderNodePoolsForNodePools(clientFactory, auth, nodePoolList!.items)
  );

  useEffect(() => {
    if (providerNodePoolsError) {
      ErrorReporter.getInstance().notify(providerNodePoolsError);
    }
  }, [providerNodePoolsError]);

  const machineTypes = useRef(getMachineTypes());

  const nodePoolsError = nodePoolListError ?? providerNodePoolsError;

  const workerNodePoolsCount = nodePoolListError
    ? -1
    : nodePoolList?.items.length;
  const workerNodesCount = nodePoolsError
    ? -1
    : getWorkerNodesCount(nodePoolList?.items);
  const workerNodesCPU = nodePoolsError
    ? -1
    : getWorkerNodesCPU(
        nodePoolList?.items,
        providerNodePools,
        machineTypes.current
      );
  const workerNodesMemory = nodePoolsError
    ? -1
    : getWorkerNodesMemory(
        nodePoolList?.items,
        providerNodePools,
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
        <Box fill={true} pad={{ bottom: 'xsmall' }}>
          <Text color='status-warning' margin={{ bottom: 'small' }}>
            No node pools
          </Text>
          <Text size='small'>
            To create node pools, switch to the{' '}
            <StyledLink to={workerNodesPath}>worker nodes</StyledLink> tab.
          </Text>
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

ClusterDetailWidgetWorkerNodes.propTypes = {
  cluster: PropTypes.object as PropTypes.Requireable<capiv1alpha3.ICluster>,
};

export default ClusterDetailWidgetWorkerNodes;
