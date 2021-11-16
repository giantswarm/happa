import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Keyboard, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import { ClusterList } from 'MAPI/types';
import {
  fetchClusterList,
  fetchClusterListKey,
  fetchProviderClustersForClusters,
  fetchProviderClustersForClustersKey,
  IProviderClusterForClusterName,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import React, { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';
import { OrganizationsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { selectOrganizations } from 'stores/organization/selectors';
import { IState } from 'stores/state';
import styled from 'styled-components';
import BaseTransition from 'styles/transitions/BaseTransition';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ClusterListEmptyPlaceholder from 'UI/Display/MAPI/clusters/ClusterList/ClusterListEmptyPlaceholder';
import ClusterListErrorPlaceholder from 'UI/Display/MAPI/clusters/ClusterList/ClusterListErrorPlaceholder';
import ClusterListNoOrgsPlaceholder from 'UI/Display/MAPI/clusters/ClusterList/ClusterListNoOrgsPlaceholder';

import ClusterListItem from './ClusterList/ClusterListItem';
import ListClustersGuide from './guides/ListClustersGuide';
import { compareClusters, mapClustersToProviderClusters } from './utils';

const LOADING_COMPONENTS = new Array(6).fill(0);

const AnimationWrapper = styled.div`
  .cluster-list-item-enter {
    opacity: 0.01;
    transform: translate3d(-50px, 0, 0);
  }
  .cluster-list-item-enter.cluster-list-item-enter-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition: 0.2s cubic-bezier(1, 0, 0, 1);
  }
  .cluster-list-item-exit {
    opacity: 1;
  }
  .cluster-list-item-exit.cluster-list-item-exit-active {
    opacity: 0.01;
    transform: translate3d(-50px, 0, 0);
    transition: 0.2s cubic-bezier(1, 0, 0, 1);
  }
`;

// eslint-disable-next-line complexity
const Clusters: React.FC<{}> = () => {
  const selectedOrgName = useSelector(
    (state: IState) => state.main.selectedOrganization
  );
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = selectedOrgName
    ? organizations[selectedOrgName]
    : undefined;
  const selectedOrgID = selectedOrg?.name ?? selectedOrg?.id;
  const hasOrgs = Object.values(organizations).length > 0;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const namespace = selectedOrg?.namespace;
  const provider = window.config.info.general.provider;

  const {
    data: clusterList,
    error: clusterListError,
    isValidating: clusterListIsValidating,
  } = useSWR<ClusterList, GenericResponseError>(
    fetchClusterListKey(provider, namespace, selectedOrgID),
    () =>
      fetchClusterList(clientFactory, auth, provider, namespace, selectedOrgID)
  );

  useEffect(() => {
    if (clusterListError) {
      ErrorReporter.getInstance().notify(clusterListError);
    }
  }, [clusterListError]);

  const providerClusterKey = clusterList
    ? fetchProviderClustersForClustersKey(clusterList.items)
    : null;

  const {
    data: providerClusterList,
    error: providerClusterListError,
    isValidating: providerClusterListIsValidating,
  } = useSWR<IProviderClusterForClusterName[], GenericResponseError>(
    providerClusterKey,
    () =>
      fetchProviderClustersForClusters(clientFactory, auth, clusterList!.items)
  );

  useEffect(() => {
    if (providerClusterListError) {
      ErrorReporter.getInstance().notify(providerClusterListError);
    }
  }, [providerClusterListError]);

  const clusterListIsLoading =
    (typeof clusterList === 'undefined' &&
      typeof clusterListError === 'undefined' &&
      clusterListIsValidating) ||
    (typeof providerClusterList === 'undefined' &&
      typeof providerClusterListError === 'undefined' &&
      providerClusterListIsValidating);

  const sortedClustersWithProviderClusters = useMemo(() => {
    if (!clusterList?.items || !providerClusterList) return undefined;

    return mapClustersToProviderClusters(
      clusterList.items,
      providerClusterList
    ).sort(compareClusters);
  }, [clusterList?.items, providerClusterList]);

  const newClusterPath = useMemo(() => {
    if (!selectedOrg) return '';

    return RoutePath.createUsablePath(OrganizationsRoutes.Clusters.New, {
      orgId: selectedOrg.id,
    });
  }, [selectedOrg]);

  const title = selectedOrgName
    ? `Cluster Overview | ${selectedOrgName}`
    : 'Cluster Overview';

  const hasNoClusters =
    hasOrgs &&
    namespace &&
    !clusterListIsLoading &&
    sortedClustersWithProviderClusters?.length === 0;

  const hasError =
    hasOrgs &&
    namespace &&
    (typeof clusterListError !== 'undefined' ||
      typeof providerClusterListError !== 'undefined') &&
    typeof sortedClustersWithProviderClusters === 'undefined';

  const releaseListClient = useRef(clientFactory());
  const { data: releaseList, error: releaseListError } = useSWR(
    releasev1alpha1.getReleaseListKey(),
    () => releasev1alpha1.getReleaseList(releaseListClient.current, auth)
  );

  useEffect(() => {
    if (releaseListError) {
      ErrorReporter.getInstance().notify(releaseListError);
    }
  }, [releaseListError]);

  return (
    <DocumentTitle title={title}>
      <Box direction='column' gap='medium'>
        {selectedOrgName && (
          <Box
            pad='medium'
            background='background-front'
            round='xsmall'
            direction='row'
            align='center'
            gap='small'
          >
            <Link to={newClusterPath}>
              <Button
                primary={true}
                tabIndex={-1}
                icon={<i className='fa fa-add-circle' />}
              >
                Launch new cluster
              </Button>
            </Link>

            {hasNoClusters && (
              <Text>
                Ready to launch your first cluster? Click the green button!
              </Text>
            )}
          </Box>
        )}

        <Box>
          {hasError && (
            <ClusterListErrorPlaceholder organizationName={selectedOrgName!} />
          )}

          {hasNoClusters && (
            <ClusterListEmptyPlaceholder organizationName={selectedOrgName!} />
          )}

          {!hasOrgs && <ClusterListNoOrgsPlaceholder />}

          {clusterListIsLoading &&
            LOADING_COMPONENTS.map((_, idx) => (
              <ClusterListItem key={idx} margin={{ bottom: 'medium' }} />
            ))}

          <Keyboard
            onSpace={(e) => {
              e.preventDefault();

              (e.target as HTMLElement).click();
            }}
          >
            <AnimationWrapper>
              <TransitionGroup>
                {!clusterListIsLoading &&
                  sortedClustersWithProviderClusters?.map(
                    ({ cluster, providerCluster }) => (
                      <BaseTransition
                        in={false}
                        key={cluster.metadata.name}
                        appear={false}
                        exit={true}
                        timeout={{ enter: 200, exit: 200 }}
                        delayTimeout={0}
                        classNames='cluster-list-item'
                      >
                        <ClusterListItem
                          cluster={cluster}
                          providerCluster={providerCluster}
                          releases={releaseList?.items}
                          organizations={organizations}
                          margin={{ bottom: 'medium' }}
                        />
                      </BaseTransition>
                    )
                  )}
              </TransitionGroup>
            </AnimationWrapper>
          </Keyboard>
        </Box>
        {namespace && (
          <Box margin={{ top: 'medium' }} direction='column' gap='small'>
            <ListClustersGuide namespace={namespace} />
          </Box>
        )}
      </Box>
    </DocumentTitle>
  );
};

export default Clusters;
