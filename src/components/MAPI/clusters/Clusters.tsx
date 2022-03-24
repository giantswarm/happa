import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { usePermissionsForReleases } from 'MAPI/releases/permissions/usePermissionsForReleases';
import { ClusterList as ClusterListType } from 'MAPI/types';
import {
  fetchClusterList,
  fetchClusterListKey,
  fetchProviderClustersForClusters,
  fetchProviderClustersForClustersKey,
  IProviderClusterForClusterName,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { OrganizationsRoutes } from 'model/constants/routes';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import { selectOrganizations } from 'model/stores/organization/selectors';
import { IState } from 'model/stores/state';
import React, { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DocumentTitle from 'shared/DocumentTitle';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ClusterListErrorPlaceholder from 'UI/Display/MAPI/clusters/ClusterList/ClusterListErrorPlaceholder';
import ClusterListNoOrgsPlaceholder from 'UI/Display/MAPI/clusters/ClusterList/ClusterListNoOrgsPlaceholder';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import RoutePath from 'utils/routePath';

import ClusterList from './ClusterList/ClusterList';
import ListClustersGuide from './guides/ListClustersGuide';
import { usePermissionsForClusters } from './permissions/usePermissionsForClusters';
import {
  compareClusters,
  IProviderClusterForCluster,
  mapClustersToProviderClusters,
} from './utils';

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
    canList: canListClusters,
    canGet: canGetClusters,
    canCreate: canCreateClusters,
  } = usePermissionsForClusters(provider, namespace ?? '');

  const hasReadPermissionsForClusters = canListClusters && canGetClusters;

  const clusterListKey = hasReadPermissionsForClusters
    ? fetchClusterListKey(provider, namespace, selectedOrgID)
    : null;

  const { data: clusterList, error: clusterListError } = useSWR<
    ClusterListType,
    GenericResponseError
  >(clusterListKey, () =>
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

  const { data: providerClusterList, error: providerClusterListError } = useSWR<
    IProviderClusterForClusterName[],
    GenericResponseError
  >(providerClusterKey, () =>
    fetchProviderClustersForClusters(clientFactory, auth, clusterList!.items)
  );

  useEffect(() => {
    if (providerClusterListError) {
      new FlashMessage(
        'There was a problem loading the cluster list.',
        messageType.ERROR,
        messageTTL.MEDIUM,
        providerClusterListError.message
      );

      ErrorReporter.getInstance().notify(providerClusterListError);
    }
  }, [providerClusterListError]);

  const clustersRef = useRef<IProviderClusterForCluster[]>();
  const sortedClustersWithProviderClusters = useMemo(() => {
    if (!clusterList?.items && !providerClusterList) {
      clustersRef.current = undefined;
    }

    if (clusterList?.items && providerClusterList) {
      clustersRef.current = mapClustersToProviderClusters(
        clusterList.items,
        providerClusterList
      ).sort(compareClusters);
    }

    return clustersRef.current;
  }, [clusterList?.items, providerClusterList]);

  const clusterListIsLoading =
    sortedClustersWithProviderClusters === undefined &&
    clusterListError === undefined &&
    providerClusterListError === undefined;

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
    namespace !== undefined &&
    !clusterListIsLoading &&
    sortedClustersWithProviderClusters?.length === 0;

  const hasError =
    hasOrgs &&
    namespace &&
    typeof clusterListError !== 'undefined' &&
    typeof sortedClustersWithProviderClusters === 'undefined';

  const releaseListClient = useRef(clientFactory());

  const { canList: canListReleases } = usePermissionsForReleases(
    provider,
    'default'
  );

  const releaseListKey = canListReleases
    ? releasev1alpha1.getReleaseListKey()
    : null;

  const { data: releaseList, error: releaseListError } = useSWR<
    releasev1alpha1.IReleaseList,
    GenericResponseError
  >(releaseListKey, () =>
    releasev1alpha1.getReleaseList(releaseListClient.current, auth)
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
          >
            {canCreateClusters ? (
              <>
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
                  <Text margin={{ left: 'small' }}>
                    Ready to launch your first cluster? Click the green button!
                  </Text>
                )}
              </>
            ) : (
              <>
                <Button
                  primary={true}
                  tabIndex={-1}
                  icon={<i className='fa fa-add-circle' />}
                  disabled={true}
                  unauthorized={true}
                >
                  Launch new cluster
                </Button>
                <Text color='text-weak' margin={{ left: 'small' }}>
                  For creating a cluster, you need additional permissions.
                  Please talk to your administrator.
                </Text>
              </>
            )}
          </Box>
        )}

        <Box>
          {!hasOrgs && <ClusterListNoOrgsPlaceholder />}

          {hasError ? (
            <ClusterListErrorPlaceholder organizationName={selectedOrgName!} />
          ) : (
            <ClusterList
              isLoading={clusterListIsLoading}
              hasNoClusters={hasNoClusters}
              orgID={selectedOrgID!}
              orgName={selectedOrgName!}
              clustersWithProviderClusters={sortedClustersWithProviderClusters}
              releases={releaseList?.items}
              organizations={organizations}
              canCreateClusters={canCreateClusters}
              canListReleases={canListReleases}
            />
          )}
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
