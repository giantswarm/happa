import { push } from 'connected-react-router';
import differenceInHours from 'date-fns/fp/differenceInHours';
import toDate from 'date-fns-tz/toDate';
import { Box, Card, CardBody, ResponsiveContext, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { usePermissionsForKeyPairs } from 'MAPI/keypairs/permissions/usePermissionsForKeyPairs';
import { ProviderCluster } from 'MAPI/types';
import { getClusterDescription, supportsReleases } from 'MAPI/utils';
import { OrganizationsRoutes } from 'model/constants/routes';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import React, { useContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
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
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import RoutePath from 'utils/routePath';

import ClusterStatus from '../ClusterStatus/ClusterStatus';
import { useClusterStatus } from '../hooks/useClusterStatus';
import {
  getClusterLabelsWithDisplayInfo,
  getClusterOrganization,
} from '../utils';
import ClusterListItemNodeInfo from './ClusterListItemNodeInfo';
import ClusterListItemReleaseInfo from './ClusterListItemReleaseInfo';
import ClusterListItemVersionsInfo from './ClusterListItemVersionsInfo';

const StyledLink = styled(Link)`
  transition: box-shadow 0.1s ease-in-out;
  display: block;
  border-radius: ${(props) => props.theme.rounding}px;

  :hover,
  :focus {
    text-decoration: none;
    outline: none;
    box-shadow: ${({ theme }) => `0 0 0 1px ${normalizeColor('text', theme)}`};
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
  canListCPNodes?: boolean;
  nameColumnWidth?: number;
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
  canListCPNodes,
  className,
  nameColumnWidth,
  ...props
}) => {
  const name = cluster?.metadata.name;

  const {
    status: clusterStatus,
    clusterUpdateSchedule,
    clusterCreationDuration,
  } = useClusterStatus(
    cluster,
    providerCluster === null ? undefined : providerCluster,
    releases
  );

  const organization = useMemo(() => {
    if (!organizations || !cluster) return undefined;

    return getClusterOrganization(cluster, organizations);
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

  const provider = window.config.info.general.provider;
  const providerFlavor = window.config.info.general.providerFlavor;

  const isDeleting = Boolean(deletionDate);
  const isLoading = typeof cluster === 'undefined';

  const description = useMemo(() => {
    if (!cluster || typeof providerCluster === 'undefined') return undefined;

    return getClusterDescription(
      cluster,
      providerCluster,
      isDeleting ? '' : undefined
    );
  }, [cluster, providerCluster, isDeleting]);

  const selectedOrg = organizations && orgId ? organizations[orgId] : undefined;
  const namespace = selectedOrg?.namespace;
  const { canCreate: canCreateKeyPairs } = usePermissionsForKeyPairs(
    provider,
    namespace ?? ''
  );

  const clusterInOrgNamespace = cluster?.metadata.namespace !== 'default';

  const [isPreviewRelease, setIsPreviewRelease] = useState(false);

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

  const isReleasesSupportedByProvider = supportsReleases(providerFlavor);

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
                  width={nameColumnWidth}
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
                  clusterCreationDuration={clusterCreationDuration}
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
                    {isReleasesSupportedByProvider ? (
                      <ClusterListItemReleaseInfo
                        cluster={cluster}
                        releases={releases}
                        canListReleases={canListReleases}
                        handleIsPreviewRelease={setIsPreviewRelease}
                      />
                    ) : (
                      <ClusterListItemVersionsInfo
                        cluster={cluster}
                        canListCPNodes={canListCPNodes}
                      />
                    )}
                  </DotSeparatedListItem>
                  {!isPreviewRelease && (
                    <DotSeparatedListItem>
                      <ClusterListItemNodeInfo cluster={cluster} />
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
