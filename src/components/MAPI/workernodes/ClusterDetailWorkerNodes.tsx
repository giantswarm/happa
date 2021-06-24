import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Heading, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import {
  extractErrorMessage,
  getOrgNamespaceFromOrgName,
} from 'MAPI/organizations/utils';
import { NodePool } from 'MAPI/types';
import {
  fetchNodePoolListForCluster,
  fetchNodePoolListForClusterKey,
  fetchProviderNodePoolsForNodePools,
  fetchProviderNodePoolsForNodePoolsKey,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import { useEffect, useMemo, useRef } from 'react';
import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { TransitionGroup } from 'react-transition-group';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { getProvider } from 'stores/main/selectors';
import styled from 'styled-components';
import BaseTransition from 'styles/transitions/BaseTransition';
import useSWR from 'swr';
import { NodePoolGridRow } from 'UI/Display/MAPI/workernodes/styles';

import { IWorkerNodesAdditionalColumn } from './types';
import WorkerNodesNodePoolItem from './WorkerNodesNodePoolItem';

const LOADING_COMPONENTS = new Array(4).fill(0);

function getAdditionalColumns(
  provider: PropertiesOf<typeof Providers>
): IWorkerNodesAdditionalColumn[] {
  if (provider === Providers.AZURE) {
    return [];
  }

  return [];
}

function formatMachineTypeColumnTitle(
  provider: PropertiesOf<typeof Providers>
) {
  switch (provider) {
    case Providers.AWS:
      return 'Instance type';
    case Providers.AZURE:
      return 'VM Size';
    default:
      return 'Machine type';
  }
}

const Header = styled(Box)<{ additionalColumnsCount?: number }>`
  ${({ additionalColumnsCount }) => NodePoolGridRow(additionalColumnsCount)}

  text-transform: uppercase;
  color: #ccc;
`;

const ColumnInfo = styled(Box)`
  ${NodePoolGridRow()}
  padding-bottom: 0;
  margin-bottom: -5px;

  & {
    place-items: end normal;
    grid-template-rows: 20px;
  }
`;

const NodesInfo = styled.div`
  grid-column: 5/9;
  position: relative;
  display: flex;
  justify-content: center;

  ::after {
    content: '';
    text-align: center;
    border: 1px solid;
    border-color: ${({ theme }) => theme.global.colors['text-weak'].dark};
    position: absolute;
    height: 10px;
    width: 95%;
    margin: auto;
    top: calc(50% - 1px);
    left: 0;
    right: 0;
    z-index: 0;
  }

  ::before {
    content: '';
    background: ${({ theme }) => theme.global.colors.background.dark};
    position: absolute;
    height: 5px;
    top: calc(50% - 1px + 5px);
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
`;

const NodesInfoText = styled(Text)`
  padding: 0 10px;
  text-transform: uppercase;
  background: ${({ theme }) => theme.global.colors.background.dark};
  z-index: 2;
`;

const AnimationWrapper = styled.div`
  .nodepool-list-item-enter {
    opacity: 0.01;
    transform: translate3d(-50px, 0, 0);
  }
  .nodepool-list-item-enter.nodepool-list-item-enter-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition: 0.2s cubic-bezier(1, 0, 0, 1);
  }
  .nodepool-list-item-exit {
    opacity: 1;
  }
  .nodepool-list-item-exit.nodepool-list-item-exit-active {
    opacity: 0.01;
    transform: translate3d(-50px, 0, 0);
    transition: 0.2s cubic-bezier(1, 0, 0, 1);
  }
`;

interface IClusterDetailWorkerNodesProps {}

const ClusterDetailWorkerNodes: React.FC<IClusterDetailWorkerNodesProps> = () => {
  const { clusterId, orgId } = useParams<{
    clusterId: string;
    orgId: string;
  }>();

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const namespace = getOrgNamespaceFromOrgName(orgId);

  const clusterClient = useRef(clientFactory());
  const {
    data: cluster,
    error: clusterError,
    isValidating: clusterIsValidating,
  } = useSWR<capiv1alpha3.ICluster, GenericResponseError>(
    capiv1alpha3.getClusterKey(namespace, clusterId),
    () =>
      capiv1alpha3.getCluster(clusterClient.current, auth, namespace, clusterId)
  );

  const {
    data: nodePoolList,
    error: nodePoolListError,
    isValidating: nodePoolListIsValidating,
  } = useSWR(fetchNodePoolListForClusterKey(cluster), () =>
    fetchNodePoolListForCluster(clientFactory, auth, cluster)
  );

  const nodePoolListIsLoading =
    (typeof cluster === 'undefined' &&
      typeof clusterError === 'undefined' &&
      clusterIsValidating) ||
    (typeof nodePoolList === 'undefined' &&
      typeof nodePoolListError === 'undefined' &&
      nodePoolListIsValidating);

  useEffect(() => {
    if (nodePoolListError) {
      new FlashMessage(
        'There was a problem loading node pools.',
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(nodePoolListError)
      );

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
      new FlashMessage(
        'There was a problem loading node pools.',
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(providerNodePoolsError)
      );

      ErrorReporter.getInstance().notify(providerNodePoolsError);
    }
  }, [providerNodePoolsError]);

  const provider = useSelector(getProvider);

  const additionalColumns = useMemo(() => getAdditionalColumns(provider), [
    provider,
  ]);

  return (
    <Box>
      <Box>
        <Heading level={2}>Node pools</Heading>
        <Text>
          A node pool is a set of nodes within a Kubernetes cluster that share
          the same configuration (machine type, CIDR range, etc.). Each node in
          the pool is labeled by the node pool&apos;s name.
        </Text>
      </Box>
      <ColumnInfo margin={{ top: 'xsmall' }}>
        <NodesInfo>
          <NodesInfoText color='text-weak' textAlign='center' size='small'>
            Nodes
          </NodesInfoText>
        </NodesInfo>
      </ColumnInfo>
      <Header additionalColumnsCount={additionalColumns.length}>
        <Box align='center' margin={{ left: '-12px' }}>
          <Text>Name</Text>
        </Box>
        <Box>
          <Text>Description</Text>
        </Box>
        <Box align='center'>
          <Text>{formatMachineTypeColumnTitle(provider)}</Text>
        </Box>
        <Box align='center'>
          <Text textAlign='center'>Availability zones</Text>
        </Box>
        <Box align='center'>
          <Text>Min</Text>
        </Box>
        <Box align='center'>
          <Text>Max</Text>
        </Box>
        <Box align='center'>
          <Text>Desired</Text>
        </Box>
        <Box align='center'>
          <Text>Current</Text>
        </Box>

        {additionalColumns.map((column) => (
          <Box align='center' key={column.title}>
            <Text textAlign='center'>{column.title}</Text>
          </Box>
        ))}

        <Box />
      </Header>
      <Box margin={{ bottom: 'small' }}>
        {nodePoolListIsLoading &&
          LOADING_COMPONENTS.map((_, idx) => (
            <WorkerNodesNodePoolItem
              key={idx}
              additionalColumns={additionalColumns}
              margin={{ bottom: 'small' }}
            />
          ))}

        <AnimationWrapper>
          <TransitionGroup>
            {!nodePoolListIsLoading &&
              nodePoolList?.items.map((np: NodePool, idx: number) => (
                <BaseTransition
                  in={false}
                  key={np.metadata.name}
                  appear={false}
                  exit={true}
                  timeout={{ enter: 200, exit: 200 }}
                  delayTimeout={0}
                  classNames='nodepool-list-item'
                >
                  <WorkerNodesNodePoolItem
                    nodePool={np}
                    providerNodePool={providerNodePools?.[idx]}
                    additionalColumns={additionalColumns}
                    margin={{ bottom: 'small' }}
                  />
                </BaseTransition>
              ))}
          </TransitionGroup>
        </AnimationWrapper>
      </Box>
    </Box>
  );
};

ClusterDetailWorkerNodes.propTypes = {};

export default ClusterDetailWorkerNodes;
