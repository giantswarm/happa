import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Heading, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { NodePool, ProviderCluster } from 'MAPI/types';
import {
  extractErrorMessage,
  fetchNodePoolListForCluster,
  fetchNodePoolListForClusterKey,
  fetchProviderClusterForCluster,
  fetchProviderClusterForClusterKey,
  fetchProviderNodePoolsForNodePools,
  fetchProviderNodePoolsForNodePoolsKey,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import { useEffect, useMemo, useRef, useState } from 'react';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useLocation, useParams } from 'react-router';
import { TransitionGroup } from 'react-transition-group';
import { Providers } from 'shared/constants';
import DocumentTitle from 'shared/DocumentTitle';
import { PropertiesOf } from 'shared/types';
import styled from 'styled-components';
import BaseTransition from 'styles/transitions/BaseTransition';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import { NodePoolGridRow } from 'UI/Display/MAPI/workernodes/styles';
import WorkerNodesNodePoolListPlaceholder from 'UI/Display/MAPI/workernodes/WorkerNodesNodePoolListPlaceholder';

import DeleteNodePoolGuide from './guides/DeleteNodePoolGuide';
import ListNodePoolsGuide from './guides/ListNodePoolsGuide';
import ModifyNodePoolGuide from './guides/ModifyNodePoolGuide';
import { IWorkerNodesAdditionalColumn } from './types';
import WorkerNodesAzureMachinePoolSpotInstances from './WorkerNodesAzureMachinePoolSpotInstances';
import WorkerNodesCreateNodePool from './WorkerNodesCreateNodePool';
import WorkerNodesNodePoolItem from './WorkerNodesNodePoolItem';

const LOADING_COMPONENTS = new Array(4).fill(0);

export function getAdditionalColumns(
  provider: PropertiesOf<typeof Providers>
): IWorkerNodesAdditionalColumn[] {
  if (provider === Providers.AZURE) {
    return [
      {
        title: 'Spot VMs',
        render: (_, providerNodePool) => {
          return (
            <WorkerNodesAzureMachinePoolSpotInstances
              providerNodePool={providerNodePool}
            />
          );
        },
      },
    ];
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

function getProviderNodePoolResourceName(
  provider: PropertiesOf<typeof Providers>
) {
  switch (provider) {
    case Providers.AWS:
      return 'MachineDeployment';
    case Providers.AZURE:
      return 'MachinePool';
    default:
      return 'MachinePool';
  }
}

const Header = styled(Box)<{ additionalColumnsCount?: number }>`
  ${({ additionalColumnsCount }) => NodePoolGridRow(additionalColumnsCount)}

  text-transform: uppercase;
  color: #ccc;
`;

const ColumnInfo = styled(Box)<{ additionalColumnsCount?: number }>`
  ${({ additionalColumnsCount }) => NodePoolGridRow(additionalColumnsCount)}

  padding-bottom: 0;
  margin-bottom: -5px;

  & {
    place-items: end normal;
    grid-template-rows: 20px;
  }
`;

const NodesInfo = styled.div`
  grid-column: 5 / span 4;
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

const ClusterDetailWorkerNodes: React.FC<IClusterDetailWorkerNodesProps> =
  // eslint-disable-next-line complexity
  () => {
    const { pathname } = useLocation();
    const { clusterId, orgId } = useParams<{
      clusterId: string;
      orgId: string;
    }>();

    const clientFactory = useHttpClientFactory();

    const auth = useAuthProvider();

    const clusterClient = useRef(clientFactory());
    const orgClient = useRef(clientFactory());

    const { data: org, error: orgError } = useSWR<
      securityv1alpha1.IOrganization,
      GenericResponseError
    >(securityv1alpha1.getOrganizationKey(orgId), () =>
      securityv1alpha1.getOrganization(orgClient.current, auth, orgId)
    );

    useEffect(() => {
      if (orgError) {
        ErrorReporter.getInstance().notify(orgError);
      }
    }, [orgError]);

    const namespace = org?.status?.namespace;

    const clusterKey = namespace
      ? capiv1alpha3.getClusterKey(namespace, clusterId)
      : null;

    const {
      data: cluster,
      error: clusterError,
      isValidating: clusterIsValidating,
    } = useSWR<capiv1alpha3.ICluster, GenericResponseError>(clusterKey, () =>
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

    const hasNoNodePools = nodePoolList?.items.length === 0;

    const { data: providerNodePools, error: providerNodePoolsError } = useSWR(
      fetchProviderNodePoolsForNodePoolsKey(nodePoolList?.items),
      () =>
        fetchProviderNodePoolsForNodePools(
          clientFactory,
          auth,
          nodePoolList!.items
        )
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

    const provider = window.config.info.general.provider;

    const additionalColumns = useMemo(
      () => getAdditionalColumns(provider),
      [provider]
    );

    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

    const handleOpenCreateForm = () => {
      setIsCreateFormOpen(true);
    };

    const handleCloseCreateForm = () => {
      setIsCreateFormOpen(false);
    };

    return (
      <DocumentTitle title={`Worker Nodes | ${clusterId}`}>
        <Breadcrumb
          data={{
            title: 'WORKER NODES',
            pathname,
          }}
        >
          <Box>
            <Box>
              <Heading level={2}>Node pools</Heading>
              <Text>
                A node pool is a set of nodes within a Kubernetes cluster that
                share the same configuration (machine type, CIDR range, etc.).
                Each node in the pool is labeled by the node pool&apos;s name.
              </Text>
            </Box>

            {!hasNoNodePools && (
              <Box>
                <ColumnInfo
                  additionalColumnsCount={additionalColumns.length}
                  margin={{ top: 'xsmall' }}
                >
                  <NodesInfo>
                    <NodesInfoText
                      color='text-weak'
                      textAlign='center'
                      size='xsmall'
                    >
                      Nodes
                    </NodesInfoText>
                  </NodesInfo>
                </ColumnInfo>
                <Header
                  additionalColumnsCount={additionalColumns.length}
                  height='xxsmall'
                >
                  <Box align='center' margin={{ left: '-12px' }}>
                    <Text size='xsmall'>Name</Text>
                  </Box>
                  <Box>
                    <Text size='xsmall'>Description</Text>
                  </Box>
                  <Box align='center'>
                    <Text size='xsmall'>
                      {formatMachineTypeColumnTitle(provider)}
                    </Text>
                  </Box>
                  <Box align='center'>
                    <Text textAlign='center' size='xsmall'>
                      Availability zones
                    </Text>
                  </Box>
                  <Box align='center'>
                    <Text size='xsmall'>Min</Text>
                  </Box>
                  <Box align='center'>
                    <Text size='xsmall'>Max</Text>
                  </Box>
                  <Box align='center'>
                    <Text size='xsmall'>Desired</Text>
                  </Box>
                  <Box align='center'>
                    <Text size='xsmall'>Current</Text>
                  </Box>

                  {additionalColumns.map((column) => (
                    <Box align='center' key={column.title}>
                      <Text textAlign='center' size='xsmall'>
                        {column.title}
                      </Text>
                    </Box>
                  ))}

                  <Box />
                </Header>
                <Box margin={{ top: 'xsmall' }}>
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
            )}

            <Box margin={{ top: 'medium' }}>
              {cluster && providerCluster && (
                <WorkerNodesCreateNodePool
                  id='0'
                  open={isCreateFormOpen}
                  onCancel={handleCloseCreateForm}
                  cluster={cluster}
                  providerCluster={providerCluster}
                />
              )}

              {!hasNoNodePools &&
                cluster &&
                providerCluster &&
                !isCreateFormOpen && (
                  <Box animation={{ type: 'fadeIn', duration: 300 }}>
                    <Button
                      onClick={handleOpenCreateForm}
                      disabled={!cluster || !providerCluster}
                    >
                      <i
                        className='fa fa-add-circle'
                        role='presentation'
                        aria-hidden={true}
                      />{' '}
                      Add node pool
                    </Button>
                  </Box>
                )}

              {hasNoNodePools && !isCreateFormOpen && (
                <WorkerNodesNodePoolListPlaceholder
                  animation={{ type: 'fadeIn', duration: 300 }}
                  onCreateButtonClick={handleOpenCreateForm}
                />
              )}
            </Box>
            {cluster && providerCluster && (
              <Box
                margin={{ top: 'large' }}
                direction='column'
                gap='small'
                basis='100%'
                animation={{ type: 'fadeIn', duration: 300 }}
              >
                <ListNodePoolsGuide
                  clusterName={cluster.metadata.name}
                  clusterNamespace={cluster.metadata.namespace!}
                  providerNodePoolResourceName={getProviderNodePoolResourceName(
                    provider
                  )}
                />
                <ModifyNodePoolGuide
                  clusterNamespace={cluster.metadata.namespace!}
                />
                <DeleteNodePoolGuide
                  clusterNamespace={cluster.metadata.namespace!}
                />
              </Box>
            )}
          </Box>
        </Breadcrumb>
      </DocumentTitle>
    );
  };

export default ClusterDetailWorkerNodes;
