import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Heading, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { usePermissionsForClusters } from 'MAPI/clusters/permissions/usePermissionsForClusters';
import { NodePoolList, ProviderCluster } from 'MAPI/types';
import { Cluster } from 'MAPI/types';
import {
  extractErrorMessage,
  fetchCluster,
  fetchClusterKey,
  fetchNodePoolListForCluster,
  fetchNodePoolListForClusterKey,
  fetchProviderClusterForCluster,
  fetchProviderClusterForClusterKey,
  fetchProviderNodePoolsForNodePools,
  fetchProviderNodePoolsForNodePoolsKey,
  IProviderNodePoolForNodePoolName,
  isNodePoolMngmtReadOnly,
  supportsNodePoolAutoscaling,
  supportsNonExpMachinePools,
  supportsReleases,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { ProviderFlavors, Providers } from 'model/constants';
import * as capav1beta1 from 'model/services/mapi/capav1beta1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import { useEffect, useMemo, useRef, useState } from 'react';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useLocation, useParams } from 'react-router';
import { TransitionGroup } from 'react-transition-group';
import { COPYABLE_PADDING } from 'shared/Copyable';
import DocumentTitle from 'shared/DocumentTitle';
import styled from 'styled-components';
import { CODE_CHAR_WIDTH, CODE_PADDING } from 'styles';
import BaseTransition from 'styles/transitions/BaseTransition';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import CLIGuidesList from 'UI/Display/MAPI/CLIGuide/CLIGuidesList';
import { NodePoolGridRow } from 'UI/Display/MAPI/workernodes/styles';
import WorkerNodesNodePoolListPlaceholder from 'UI/Display/MAPI/workernodes/WorkerNodesNodePoolListPlaceholder';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import DeleteNodePoolGuide from './guides/DeleteNodePoolGuide';
import ListNodePoolsGuide from './guides/ListNodePoolsGuide';
import ModifyNodePoolGuide from './guides/ModifyNodePoolGuide';
import { usePermissionsForNodePools } from './permissions/usePermissionsForNodePools';
import { IWorkerNodesAdditionalColumn } from './types';
import { mapNodePoolsToProviderNodePools } from './utils';
import WorkerNodesCreateNodePool from './WorkerNodesCreateNodePool';
import WorkerNodesNodePoolItem, {
  MAX_NAME_LENGTH,
} from './WorkerNodesNodePoolItem';
import WorkerNodesSpotInstancesAWS from './WorkerNodesSpotInstancesAWS';
import WorkerNodesSpotInstancesAzure from './WorkerNodesSpotInstancesAzure';
import WorkerNodesSpotInstancesCAPA from './WorkerNodesSpotInstancesCAPA';

const LOADING_COMPONENTS = new Array(4).fill(0);

export function getAdditionalColumns(
  cluster: Cluster
): IWorkerNodesAdditionalColumn[] {
  const infrastructureRef = cluster?.spec?.infrastructureRef;
  if (!infrastructureRef) return [];

  const { kind, apiVersion } = infrastructureRef;

  switch (true) {
    case kind === capav1beta1.AWSCluster &&
      apiVersion === capav1beta1.ApiVersion:
      return [
        {
          title: 'Spot instances',
          render: (_, providerNodePool) => {
            return (
              <WorkerNodesSpotInstancesCAPA
                providerNodePool={
                  providerNodePool as capav1beta1.IAWSMachinePool
                }
              />
            );
          },
        },
      ];

    case kind === capzv1beta1.AzureCluster:
      return [
        {
          title: 'Spot VMs',
          render: (_, providerNodePool) => {
            return (
              <WorkerNodesSpotInstancesAzure
                providerNodePool={
                  providerNodePool as
                    | capzexpv1alpha3.IAzureMachinePool
                    | capzv1beta1.IAzureMachinePool
                }
              />
            );
          },
        },
      ];

    case kind === infrav1alpha3.AWSCluster &&
      apiVersion === infrav1alpha3.ApiVersion:
      return [
        {
          title: 'Spot count',
          render: (_, providerNodePool) => {
            return (
              <WorkerNodesSpotInstancesAWS
                providerNodePool={
                  providerNodePool as infrav1alpha3.IAWSMachineDeployment
                }
              />
            );
          },
        },
      ];

    default:
      return [];
  }
}

function formatMachineTypeColumnTitle(
  provider: PropertiesOf<typeof Providers>
) {
  switch (provider) {
    case Providers.AWS:
    case Providers.CAPA:
    case Providers.GCP:
      return 'Instance type';
    case Providers.AZURE:
      return 'VM Size';
    default:
      return 'Machine type';
  }
}

function formatAZsColumnTitle(provider: PropertiesOf<typeof Providers>) {
  return provider === Providers.GCP ? 'Zones' : 'Availability zones';
}

function getFlatcarContainerLinuxVersion(
  release: releasev1alpha1.IRelease
): string | undefined {
  return release.spec.components.find(
    (component) => component.name === 'containerlinux'
  )?.version;
}

function getNameColumnWidth(nameLength: number) {
  const charCount = Math.min(nameLength, MAX_NAME_LENGTH);

  return charCount * CODE_CHAR_WIDTH + COPYABLE_PADDING + CODE_PADDING * 2;
}

const Header = styled(Box)<{
  additionalColumnsCount?: number;
  nameColumnWidth?: number;
  displayMenuColumn?: boolean;
}>`
  ${({ additionalColumnsCount, nameColumnWidth, displayMenuColumn }) =>
    NodePoolGridRow(additionalColumnsCount, nameColumnWidth, displayMenuColumn)}

  text-transform: uppercase;
  color: #ccc;
`;

const ColumnInfo = styled(Box)<{
  additionalColumnsCount?: number;
  nameColumnWidth?: number;
  displayMenuColumn?: boolean;
}>`
  ${({ additionalColumnsCount, nameColumnWidth, displayMenuColumn }) =>
    NodePoolGridRow(additionalColumnsCount, nameColumnWidth, displayMenuColumn)}

  padding-bottom: 0;
  margin-bottom: -5px;

  & {
    place-items: end normal;
    grid-template-rows: 20px;
  }
`;

const NodesInfo = styled.div<{
  displayCGroupsColumn: boolean;
  hideNodePoolAutoscalingColumns?: boolean;
}>`
  grid-column: ${({ displayCGroupsColumn, hideNodePoolAutoscalingColumns }) =>
    `${displayCGroupsColumn ? 6 : 5} / span ${
      hideNodePoolAutoscalingColumns ? 2 : 4
    }`};
  position: relative;
  display: flex;
  justify-content: center;

  ::after {
    content: '';
    text-align: center;
    border: 1px solid;
    border-color: ${({ theme }) => normalizeColor('text-weak', theme)};
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
    background: ${({ theme }) => normalizeColor('background', theme)};
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
  background: ${({ theme }) => normalizeColor('background', theme)};
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

const ClusterDetailWorkerNodes: React.FC<
  React.PropsWithChildren<IClusterDetailWorkerNodesProps>
> =
  // eslint-disable-next-line complexity
  () => {
    const { pathname, state } = useLocation<{ hasNoNodePools?: boolean }>();
    const { clusterId, orgId } = useParams<{
      clusterId: string;
      orgId: string;
    }>();

    const clientFactory = useHttpClientFactory();

    const auth = useAuthProvider();

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

    const provider = window.config.info.general.provider;
    const providerFlavour = window.config.info.general.providerFlavor;

    const { canGet: canGetCluster } = usePermissionsForClusters(
      provider,
      namespace ?? ''
    );

    const clusterKey =
      canGetCluster && namespace
        ? fetchClusterKey(provider, namespace, clusterId)
        : null;

    const { data: cluster, isLoading: clusterIsLoading } = useSWR<
      Cluster,
      GenericResponseError
    >(clusterKey, () =>
      fetchCluster(clientFactory, auth, provider, namespace!, clusterId)
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
      canList: canListNodePools,
      canGet: canGetNodePools,
      canCreate: canCreateNodePools,
      canUpdate: canUpdateNodePools,
      canDelete: canDeleteNodePools,
    } = usePermissionsForNodePools(provider, cluster?.metadata.namespace ?? '');

    const nodePoolListForClusterKey =
      cluster && canListNodePools && canGetNodePools
        ? fetchNodePoolListForClusterKey(cluster, cluster.metadata.namespace)
        : null;

    const {
      data: nodePoolList,
      error: nodePoolListError,
      isLoading: nodePoolListIsLoading,
    } = useSWR<NodePoolList, GenericResponseError>(
      nodePoolListForClusterKey,
      () =>
        fetchNodePoolListForCluster(
          clientFactory,
          auth,
          cluster,
          cluster!.metadata.namespace
        )
    );

    const isLoading = clusterIsLoading || nodePoolListIsLoading;

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

    const { data: providerNodePools, error: providerNodePoolsError } = useSWR<
      IProviderNodePoolForNodePoolName[],
      GenericResponseError
    >(fetchProviderNodePoolsForNodePoolsKey(nodePoolList?.items), () =>
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

    const nodePoolsWithProviderNodePools = useMemo(() => {
      if (!nodePoolList?.items || !providerNodePools) return [];

      return mapNodePoolsToProviderNodePools(
        nodePoolList.items,
        providerNodePools
      );
    }, [nodePoolList?.items, providerNodePools]);

    const isReleasesSupportedByProvider = supportsReleases(provider);
    const clusterReleaseVersion =
      cluster && isReleasesSupportedByProvider
        ? capiv1beta1.getReleaseVersion(cluster)
        : undefined;

    const releaseListKey =
      !hasNoNodePools && clusterReleaseVersion
        ? releasev1alpha1.getReleaseKey(`v${clusterReleaseVersion}`)
        : null;

    const releaseListClient = useRef(clientFactory());

    const { data: release, error: releaseError } = useSWR<
      releasev1alpha1.IRelease,
      GenericResponseError
    >(releaseListKey, () =>
      releasev1alpha1.getRelease(
        releaseListClient.current,
        auth,
        `v${clusterReleaseVersion}`
      )
    );

    useEffect(() => {
      if (releaseError) {
        ErrorReporter.getInstance().notify(releaseError);
      }
    }, [releaseError]);

    const flatcarContainerLinuxVersion = useMemo(() => {
      if (!release) return undefined;

      return getFlatcarContainerLinuxVersion(release);
    }, [release]);

    const longestNameLength = nodePoolsWithProviderNodePools.reduce(
      (maxLength, item) => {
        const length = item.nodePool.metadata.name.length;

        return Math.max(length, maxLength);
      },
      0
    );
    const nameColumnWidth = getNameColumnWidth(longestNameLength);

    const additionalColumns = useMemo(() => {
      if (!cluster) return [];

      return getAdditionalColumns(cluster);
    }, [cluster]);

    const [isCreateFormOpen, setIsCreateFormOpen] = useState(
      state?.hasNoNodePools ?? false
    );

    const handleOpenCreateForm = () => {
      setIsCreateFormOpen(true);
    };

    const handleCloseCreateForm = () => {
      setIsCreateFormOpen(false);
    };

    const isReadOnly = cluster && isNodePoolMngmtReadOnly(cluster);

    const usesNonExpMachinePools = useMemo(() => {
      if (!cluster) return false;

      return supportsNonExpMachinePools(cluster);
    }, [cluster]);

    const displayCGroupsColumn = providerFlavour === ProviderFlavors.VINTAGE;
    const hideNodePoolAutoscalingColumns =
      cluster && !supportsNodePoolAutoscaling(cluster);

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

            {!hasNoNodePools && cluster && (
              <Box>
                <ColumnInfo
                  additionalColumnsCount={
                    additionalColumns.length +
                    Number(displayCGroupsColumn) +
                    (hideNodePoolAutoscalingColumns ? 0 : 2)
                  }
                  nameColumnWidth={nameColumnWidth}
                  displayMenuColumn={!isReadOnly}
                  margin={{ top: 'xsmall' }}
                >
                  <NodesInfo
                    displayCGroupsColumn={displayCGroupsColumn}
                    hideNodePoolAutoscalingColumns={
                      hideNodePoolAutoscalingColumns
                    }
                  >
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
                  additionalColumnsCount={
                    additionalColumns.length +
                    Number(displayCGroupsColumn) +
                    (hideNodePoolAutoscalingColumns ? 0 : 2)
                  }
                  nameColumnWidth={nameColumnWidth}
                  displayMenuColumn={!isReadOnly}
                  height='xxsmall'
                >
                  <Box
                    align='center'
                    margin={{ right: `${COPYABLE_PADDING}px` }}
                  >
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
                      {formatAZsColumnTitle(provider)}
                    </Text>
                  </Box>
                  {displayCGroupsColumn && (
                    <Box align='center'>
                      <Text size='xsmall'>CGroups</Text>
                    </Box>
                  )}
                  {!hideNodePoolAutoscalingColumns && (
                    <>
                      <Box align='center'>
                        <Text size='xsmall'>Min</Text>
                      </Box>
                      <Box align='center'>
                        <Text size='xsmall'>Max</Text>
                      </Box>
                    </>
                  )}
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
                  {isLoading &&
                    LOADING_COMPONENTS.map((_, idx) => (
                      <WorkerNodesNodePoolItem
                        key={idx}
                        additionalColumns={additionalColumns}
                        nameColumnWidth={nameColumnWidth}
                        margin={{ bottom: 'small' }}
                        readOnly={isReadOnly}
                        displayCGroupsVersion={displayCGroupsColumn}
                        hideNodePoolAutoscaling={hideNodePoolAutoscalingColumns}
                      />
                    ))}

                  <AnimationWrapper>
                    <TransitionGroup>
                      {!isLoading &&
                        nodePoolsWithProviderNodePools.map(
                          ({ nodePool, providerNodePool }) => (
                            <BaseTransition
                              in={false}
                              key={nodePool.metadata.name}
                              appear={false}
                              exit={true}
                              timeout={{ enter: 200, exit: 200 }}
                              delayTimeout={0}
                              classNames='nodepool-list-item'
                            >
                              <WorkerNodesNodePoolItem
                                nodePool={nodePool}
                                providerNodePool={providerNodePool}
                                additionalColumns={additionalColumns}
                                displayCGroupsVersion={displayCGroupsColumn}
                                nameColumnWidth={nameColumnWidth}
                                margin={{ bottom: 'small' }}
                                readOnly={isReadOnly}
                                canUpdateNodePools={canUpdateNodePools}
                                canDeleteNodePools={canDeleteNodePools}
                                flatcarContainerLinuxVersion={
                                  flatcarContainerLinuxVersion
                                }
                                hideNodePoolAutoscaling={
                                  hideNodePoolAutoscalingColumns
                                }
                              />
                            </BaseTransition>
                          )
                        )}
                    </TransitionGroup>
                  </AnimationWrapper>
                </Box>
              </Box>
            )}

            <Box margin={{ top: 'medium' }}>
              {cluster && providerCluster && !isReadOnly && (
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
                !isReadOnly &&
                !isCreateFormOpen && (
                  <Box
                    animation={{ type: 'fadeIn', duration: 300 }}
                    direction='row'
                    align='center'
                    gap='small'
                  >
                    <Button
                      onClick={handleOpenCreateForm}
                      disabled={
                        !cluster || !providerCluster || !canCreateNodePools
                      }
                      unauthorized={!canCreateNodePools}
                    >
                      <i
                        className='fa fa-add-circle'
                        role='presentation'
                        aria-hidden={true}
                      />{' '}
                      Add node pool
                    </Button>
                    {!canCreateNodePools && (
                      <Text color='text-weak'>
                        For creating a node pool, you need additional
                        permissions. Please talk to your administrator.
                      </Text>
                    )}
                  </Box>
                )}

              {hasNoNodePools && !isCreateFormOpen && (
                <WorkerNodesNodePoolListPlaceholder
                  animation={{ type: 'fadeIn', duration: 300 }}
                  onCreateButtonClick={handleOpenCreateForm}
                  readOnly={isReadOnly}
                  canCreateNodePools={canCreateNodePools}
                />
              )}
            </Box>
            {cluster && providerCluster && (
              <CLIGuidesList
                margin={{ top: 'large' }}
                animation={{ type: 'fadeIn', duration: 300 }}
              >
                <ListNodePoolsGuide
                  clusterName={cluster.metadata.name}
                  clusterNamespace={cluster.metadata.namespace!}
                  provider={provider}
                />

                {!isReadOnly && (
                  <ModifyNodePoolGuide
                    clusterNamespace={cluster.metadata.namespace!}
                    provider={provider}
                    canUpdateNodePools={canUpdateNodePools}
                    usesNonExpMachinePools={usesNonExpMachinePools}
                  />
                )}
                {!isReadOnly && (
                  <DeleteNodePoolGuide
                    clusterNamespace={cluster.metadata.namespace!}
                    provider={provider}
                    canDeleteNodePools={canDeleteNodePools}
                    usesNonExpMachinePools={usesNonExpMachinePools}
                  />
                )}
              </CLIGuidesList>
            )}
          </Box>
        </Breadcrumb>
      </DocumentTitle>
    );
  };

export default ClusterDetailWorkerNodes;
