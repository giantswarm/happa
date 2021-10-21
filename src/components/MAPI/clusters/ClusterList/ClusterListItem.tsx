import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import differenceInHours from 'date-fns/fp/differenceInHours';
import toDate from 'date-fns-tz/toDate';
import { Box, Card, CardBody, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { relativeDate } from 'lib/helpers';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import { ProviderCluster } from 'MAPI/types';
import {
  extractErrorMessage,
  fetchNodePoolListForCluster,
  fetchNodePoolListForClusterKey,
  fetchProviderNodePoolsForNodePools,
  fetchProviderNodePoolsForNodePoolsKey,
  getClusterDescription,
  getMachineTypes,
} from 'MAPI/utils';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { getUserIsAdmin } from 'stores/main/selectors';
import styled from 'styled-components';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';
import ClusterListItemMainInfo from 'UI/Display/MAPI/clusters/ClusterList/ClusterListItemMainInfo';
import ClusterListItemNodeInfo from 'UI/Display/MAPI/clusters/ClusterList/ClusterListItemNodeInfo';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

import {
  getWorkerNodesCount,
  getWorkerNodesCPU,
  getWorkerNodesMemory,
} from '../utils';
import ClusterListItemStatus from './ClusterListItemStatus';

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
  cluster?: capiv1alpha3.ICluster;
  providerCluster?: ProviderCluster;
  releases?: releasev1alpha1.IRelease[];
  organizations?: Record<string, IOrganization>;
}

const ClusterListItem: React.FC<IClusterListItemProps> = ({
  cluster,
  providerCluster,
  releases,
  organizations,
  ...props
}) => {
  const name = cluster?.metadata.name;
  const description = useMemo(() => {
    if (!cluster) return undefined;

    return getClusterDescription(cluster, providerCluster, '');
  }, [cluster, providerCluster]);

  const releaseVersion = cluster
    ? capiv1alpha3.getReleaseVersion(cluster)
    : undefined;

  const organization = useMemo(() => {
    if (!organizations || !cluster) return undefined;

    const org = capiv1alpha3.getClusterOrganization(cluster);
    if (!org) return undefined;

    return Object.values(organizations).find((o) => o.name === org)?.id;
  }, [cluster, organizations]);

  const creationDate = cluster?.metadata.creationTimestamp;
  const deletionDate = cluster?.metadata.deletionTimestamp;

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

  const k8sVersion = useMemo(() => {
    const formattedReleaseVersion = `v${releaseVersion}`;

    if (!releases) return undefined;

    const release = releases.find(
      (r) => r.metadata.name === formattedReleaseVersion
    );
    if (!release) return '';

    const version = releasev1alpha1.getK8sVersion(release);
    if (typeof version === 'undefined') return '';

    return version;
  }, [releases, releaseVersion]);

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const { data: nodePoolList, error: nodePoolListError } = useSWR(
    fetchNodePoolListForClusterKey(cluster),
    () => fetchNodePoolListForCluster(clientFactory, auth, cluster)
  );

  useEffect(() => {
    if (nodePoolListError) {
      ErrorReporter.getInstance().notify(nodePoolListError);
    }
  }, [nodePoolListError]);

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
      ErrorReporter.getInstance().notify(providerNodePoolsError);
    }
  }, [providerNodePoolsError]);

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

  const isAdmin = useSelector(getUserIsAdmin);
  const provider = window.config.info.general.provider;

  const workerNodesCount = getWorkerNodesCount(nodePoolList?.items);

  const isDeleting = Boolean(deletionDate);
  const hasError = typeof nodePoolListError !== 'undefined';
  const isLoading = typeof cluster === 'undefined';

  const shouldDisplayGetStarted = useMemo(() => {
    if (isDeleting || isLoading || !creationDate) return false;

    const createDate = toDate(creationDate, { timeZone: 'UTC' });
    const age = differenceInHours(createDate)(new Date());

    // Cluster is older than 30 days.
    // eslint-disable-next-line no-magic-numbers
    return age < 30 * 24;
  }, [creationDate, isDeleting, isLoading]);

  const dispatch = useDispatch();

  const handleGetStartedClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    if (!organization || !name) return;

    const path = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.GettingStarted.Overview,
      {
        orgId: organization,
        clusterId: name,
      }
    );

    dispatch(push(path));
  };

  return (
    <StyledLink
      to={isDeleting || isLoading ? '' : clusterPath}
      aria-label={isLoading ? 'Loading cluster...' : `Cluster ${name}`}
      aria-disabled={isDeleting || isLoading}
      tabIndex={isDeleting || isLoading ? -1 : 0}
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
        <CardBody direction='row' gap='xsmall' wrap={true}>
          <Box>
            <OptionalValue value={name}>
              {(value) => (
                <Text size='large' aria-label={`Name: ${value}`}>
                  <ClusterIDLabel
                    clusterID={value as string}
                    variant={ClusterIDLabelType.Name}
                    copyEnabled={true}
                  />
                </Text>
              )}
            </OptionalValue>
          </Box>
          <Box basis='75%'>
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

              {cluster && (
                <ClusterListItemStatus
                  cluster={cluster}
                  provider={provider}
                  isAdmin={isAdmin}
                  releases={releases}
                />
              )}
            </Box>

            {isDeleting ? (
              <Text color='text-xweak'>
                Deleted {relativeDate(deletionDate)}
              </Text>
            ) : (
              <ClusterListItemMainInfo
                creationDate={creationDate}
                releaseVersion={releaseVersion}
                k8sVersion={k8sVersion}
              />
            )}

            {!hasError && !isDeleting && (
              <ClusterListItemNodeInfo
                workerNodePoolsCount={nodePoolList?.items.length}
                workerNodesCPU={workerNodesCPU}
                workerNodesCount={workerNodesCount}
                workerNodesMemory={workerNodesMemory}
              />
            )}

            {hasError && !isDeleting && (
              <Text color='status-critical' aria-label='Cluster load error'>
                {extractErrorMessage(nodePoolListError)}
              </Text>
            )}
          </Box>

          {shouldDisplayGetStarted && (
            <Box
              align='end'
              basis='15%'
              width={{ min: '120px' }}
              flex={{ grow: 1 }}
            >
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
