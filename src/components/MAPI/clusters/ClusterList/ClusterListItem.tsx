import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import differenceInHours from 'date-fns/fp/differenceInHours';
import toDate from 'date-fns-tz/toDate';
import { Box, Card, CardBody, ResponsiveContext, Text } from 'grommet';
import { usePermissionsForKeyPairs } from 'MAPI/keypairs/permissions/usePermissionsForKeyPairs';
import { NodePoolList, ProviderCluster } from 'MAPI/types';
import {
  extractErrorMessage,
  fetchNodePoolListForCluster,
  fetchNodePoolListForClusterKey,
  fetchProviderNodePoolsForNodePools,
  fetchProviderNodePoolsForNodePoolsKey,
  getClusterDescription,
  getMachineTypes,
  IProviderNodePoolForNodePoolName,
} from 'MAPI/utils';
import { usePermissionsForNodePools } from 'MAPI/workernodes/permissions/usePermissionsForNodePools';
import { mapNodePoolsToProviderNodePools } from 'MAPI/workernodes/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { OrganizationsRoutes } from 'model/constants/routes';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';
import FormattedDate from 'UI/Display/Date';
import {
  DotSeparatedList,
  DotSeparatedListItem,
} from 'UI/Display/DotSeparatedList/DotSeparatedList';
import ClusterListItemLabels from 'UI/Display/MAPI/clusters/ClusterList/ClusterListItemLabels';
import ClusterListItemMainInfo from 'UI/Display/MAPI/clusters/ClusterList/ClusterListItemMainInfo';
import ClusterListItemNodeInfo from 'UI/Display/MAPI/clusters/ClusterList/ClusterListItemNodeInfo';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import RoutePath from 'utils/routePath';

import ClusterStatus from '../ClusterStatus/ClusterStatus';
import { useClusterStatus } from '../hooks/useClusterStatus';
import {
  getClusterLabelsWithDisplayInfo,
  getWorkerNodesCount,
  getWorkerNodesCPU,
  getWorkerNodesMemory,
} from '../utils';

const StyledLink = styled(Link)`
  transition: box-shadow 0.1s ease-in-out;
  display: block;
  border-radius: ${(props) => props.theme.rounding}px;

  :hover,
  :focus {
    text-decoration: none;
    outline: none;
    box-shadow: ${(props) =>
      `0 0 0 1px ${props.theme.global.colors.text.dark}`};
  }

  &[aria-disabled='true'] {
    cursor: default;

    :hover,
    :focus {
      box-shadow: none;
    }
  }
`;

interface IClusterListItemProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  cluster?: capiv1beta1.ICluster;
  providerCluster?: ProviderCluster | null;
  releases?: releasev1alpha1.IRelease[];
  organizations?: Record<string, IOrganization>;
  canCreateClusters?: boolean;
  canListReleases?: boolean;
}

const ClusterListItem: React.FC<
  React.PropsWithChildren<IClusterListItemProps>
  // eslint-disable-next-line complexity
> = ({
  cluster,
  providerCluster,
  releases,
  organizations,
  canCreateClusters,
  canListReleases,
  className,
  ...props
}) => {
  const name = cluster?.metadata.name;
  const description = useMemo(() => {
    if (!cluster || typeof providerCluster === 'undefined') return undefined;

    return getClusterDescription(cluster, providerCluster, '');
  }, [cluster, providerCluster]);

  const { status: clusterStatus, clusterUpdateSchedule } = useClusterStatus(
    cluster,
    providerCluster === null ? undefined : providerCluster,
    releases
  );

  const releaseVersion = cluster
    ? capiv1beta1.getReleaseVersion(cluster)
    : undefined;

  const organization = useMemo(() => {
    if (!organizations || !cluster) return undefined;

    const org = capiv1beta1.getClusterOrganization(cluster);
    if (!org) return undefined;

    return Object.values(organizations).find(
      (o) => o.name === org || o.id === org
    );
  }, [cluster, organizations]);

  const orgId = organization?.id;

  const creationDate = cluster?.metadata.creationTimestamp;
  const deletionDate = cluster?.metadata.deletionTimestamp;

  const clusterPath = useMemo(() => {
    if (!orgId || !name) return '';

    return RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: orgId,
        clusterId: name,
      }
    );
  }, [orgId, name]);

  const release = useMemo(() => {
    const formattedReleaseVersion = `v${releaseVersion}`;

    if (!releases) return undefined;

    return releases.find((r) => r.metadata.name === formattedReleaseVersion);
  }, [releases, releaseVersion]);

  const k8sVersion = useMemo(() => {
    // if releases and permissions are loading, show loading placeholder
    if (!releases && typeof canListReleases === 'undefined') return undefined;
    if (typeof release === 'undefined') return '';

    return releasev1alpha1.getK8sVersion(release) ?? '';
  }, [canListReleases, release, releases]);

  const isPreviewRelease = release?.spec.state === 'preview';

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

  const isDeleting = Boolean(deletionDate);
  const hasError = typeof nodePoolListError !== 'undefined';
  const isLoading = typeof cluster === 'undefined';

  const selectedOrg = organizations && orgId ? organizations[orgId] : undefined;
  const namespace = selectedOrg?.namespace;
  const { canCreate: canCreateKeyPairs } = usePermissionsForKeyPairs(
    provider,
    namespace ?? ''
  );

  const clusterInOrgNamespace = cluster?.metadata.namespace !== 'default';

  const shouldDisplayGetStarted = useMemo(() => {
    if (
      isDeleting ||
      isLoading ||
      !creationDate ||
      !canCreateKeyPairs ||
      isPreviewRelease ||
      !clusterInOrgNamespace
    )
      return false;

    const createDate = toDate(creationDate, { timeZone: 'UTC' });
    const age = differenceInHours(createDate)(new Date());

    // Cluster is older than 30 days.
    // eslint-disable-next-line no-magic-numbers
    return age < 30 * 24;
  }, [
    isDeleting,
    isLoading,
    creationDate,
    canCreateKeyPairs,
    isPreviewRelease,
    clusterInOrgNamespace,
  ]);

  const labels = useMemo(() => {
    if (typeof cluster === 'undefined') {
      return undefined;
    }

    const existingLabels = capiv1beta1.getClusterLabels(cluster);

    return getClusterLabelsWithDisplayInfo(existingLabels);
  }, [cluster]);

  const dispatch = useDispatch();

  const handleGetStartedClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    if (!orgId || !name) return;

    const path = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.GettingStarted.Overview,
      {
        orgId: orgId,
        clusterId: name,
      }
    );

    dispatch(push(path));
  };

  const disableNavigation = isDeleting || isLoading || isPreviewRelease;

  const screenSize = useContext(ResponsiveContext);

  return (
    <StyledLink
      className={className}
      to={disableNavigation ? '' : clusterPath}
      aria-label={isLoading ? 'Loading cluster...' : `Cluster ${name}`}
      aria-disabled={disableNavigation}
      tabIndex={disableNavigation ? -1 : 0}
      {...props}
    >
      <Card
        direction='row'
        elevation='none'
        overflow='visible'
        background={isDeleting ? 'background-back' : 'background-front'}
        round='xsmall'
        pad='medium'
        gap='small'
        {...props}
      >
        <CardBody
          direction={screenSize === 'small' ? 'column' : 'row'}
          gap='xsmall'
        >
          <OptionalValue value={name}>
            {(value) => (
              <Text size='large' aria-label={`Name: ${value}`}>
                <ClusterIDLabel
                  clusterID={value}
                  variant={ClusterIDLabelType.Name}
                  copyEnabled={true}
                />
              </Text>
            )}
          </OptionalValue>
          <Box flex={{ grow: 1, shrink: 1 }} basis='0%' align='flex-start'>
            <Box direction='row' align='center' wrap={true} gap='small'>
              <OptionalValue value={description}>
                {(value) => (
                  <Text
                    weight='bold'
                    size='large'
                    aria-label={`Description: ${value}`}
                  >
                    {value}
                  </Text>
                )}
              </OptionalValue>

              {clusterStatus && (
                <ClusterStatus
                  status={clusterStatus}
                  clusterUpdateSchedule={clusterUpdateSchedule}
                />
              )}
            </Box>

            {isDeleting ? (
              <Text color='text-xweak'>
                Deleted <FormattedDate relative={true} value={deletionDate} />
              </Text>
            ) : (
              <>
                <DotSeparatedList wrap={true}>
                  <DotSeparatedListItem>
                    <ClusterListItemMainInfo
                      creationDate={creationDate}
                      releaseVersion={releaseVersion}
                      isPreviewRelease={isPreviewRelease}
                      k8sVersion={k8sVersion}
                    />
                  </DotSeparatedListItem>
                  {!hasError && !isPreviewRelease && (
                    <DotSeparatedListItem>
                      <ClusterListItemNodeInfo
                        workerNodePoolsCount={workerNodePoolsCount}
                        workerNodesCPU={workerNodesCPU}
                        workerNodesCount={workerNodesCount}
                        workerNodesMemory={workerNodesMemory}
                      />
                    </DotSeparatedListItem>
                  )}
                </DotSeparatedList>
                {labels && labels.length > 0 && (
                  <ClusterListItemLabels
                    labels={labels}
                    margin={{ top: 'small' }}
                  />
                )}
              </>
            )}

            {hasError && !isDeleting && (
              <Text color='status-critical' aria-label='Cluster load error'>
                {extractErrorMessage(nodePoolListError)}
              </Text>
            )}
          </Box>

          {shouldDisplayGetStarted && (
            <Box align='end'>
              <Button
                onClick={handleGetStartedClick}
                icon={
                  <i
                    className='fa fa-start'
                    aria-hidden={true}
                    role='presentation'
                  />
                }
              >
                Get started
              </Button>
            </Box>
          )}
        </CardBody>
      </Card>
    </StyledLink>
  );
};

export default ClusterListItem;
