import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Heading } from 'grommet';
import { usePermissionsForApps } from 'MAPI/apps/permissions/usePermissionsForApps';
import { filterUserInstalledApps } from 'MAPI/apps/utils';
import { Cluster, NodePoolList, ProviderCluster } from 'MAPI/types';
import {
  extractErrorMessage,
  fetchCluster,
  fetchClusterKey,
  fetchNodePoolListForCluster,
  fetchNodePoolListForClusterKey,
  fetchProviderClusterForCluster,
  fetchProviderClusterForClusterKey,
  getClusterDescription,
} from 'MAPI/utils';
import { usePermissionsForNodePools } from 'MAPI/workernodes/permissions/usePermissionsForNodePools';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useLocation, useParams } from 'react-router';
import DocumentTitle from 'shared/DocumentTitle';
import useSWR from 'swr';
import ClusterDetailDeleteAction, {
  ClusterDetailDeleteActionNameVariant,
} from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailDeleteAction';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import DeleteClusterGuide from '../guides/DeleteClusterGuide';
import { usePermissionsForClusters } from '../permissions/usePermissionsForClusters';
import { getWorkerNodesCount } from '../utils';
import { deleteClusterResources } from './utils';

interface IClusterDetailActionsProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

// eslint-disable-next-line complexity
const ClusterDetailActions: React.FC<IClusterDetailActionsProps> = (props) => {
  const { pathname } = useLocation();
  const { clusterId, orgId } = useParams<{
    clusterId: string;
    orgId: string;
  }>();

  const provider = window.config.info.general.provider;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const orgClient = useRef(clientFactory());

  // The error is handled in the parent component.
  const { data: org, error: orgError } = useSWR<
    securityv1alpha1.IOrganization,
    GenericResponseError
  >(securityv1alpha1.getOrganizationKey(orgId), () =>
    securityv1alpha1.getOrganization(orgClient.current, auth, orgId)
  );

  const namespace = org?.status?.namespace;

  const { canGet: canGetClusters, canDelete: canDeleteClusters } =
    usePermissionsForClusters(provider, namespace ?? '');

  const clusterKey =
    canGetClusters && namespace
      ? fetchClusterKey(provider, namespace, clusterId)
      : null;

  // The error is handled in the parent component.
  const { data: cluster, error: clusterError } = useSWR<
    Cluster,
    GenericResponseError
  >(clusterKey, () =>
    fetchCluster(clientFactory, auth, provider, namespace!, clusterId)
  );

  const providerClusterKey = cluster
    ? fetchProviderClusterForClusterKey(cluster)
    : null;

  // The error is handled in the parent component.
  const { data: providerCluster, error: providerClusterError } = useSWR<
    ProviderCluster,
    GenericResponseError
  >(providerClusterKey, () =>
    fetchProviderClusterForCluster(clientFactory, auth, cluster!)
  );

  const { canList: canListNodePools } = usePermissionsForNodePools(
    provider,
    cluster?.metadata.namespace ?? ''
  );

  const nodePoolListForClusterKey =
    canListNodePools && cluster
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

      const errorMessage = extractErrorMessage(nodePoolListError);
      new FlashMessage(
        (
          <>
            There was a problem loading node pools for cluster{' '}
            <code>{clusterId}</code>.
          </>
        ),
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );
    }
  }, [nodePoolListError, clusterId]);

  const appListClient = useRef(clientFactory());

  const { canList: canListApps } = usePermissionsForApps(provider, clusterId);

  const appListGetOptions = { namespace: clusterId };
  const appListKey = canListApps
    ? applicationv1alpha1.getAppListKey(appListGetOptions)
    : null;

  const { data: appList, error: appListError } = useSWR<
    applicationv1alpha1.IAppList,
    GenericResponseError
  >(appListKey, () =>
    applicationv1alpha1.getAppList(
      appListClient.current,
      auth,
      appListGetOptions
    )
  );

  useEffect(() => {
    if (appListError) {
      ErrorReporter.getInstance().notify(appListError);

      const errorMessage = extractErrorMessage(appListError);
      new FlashMessage(
        (
          <>
            There was a problem loading apps for cluster{' '}
            <code>{clusterId}</code>.
          </>
        ),
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );
    }
  }, [appListError, clusterId]);

  const userInstalledApps = useMemo(() => {
    if (!appList) return undefined;

    return filterUserInstalledApps(appList.items, true);
  }, [appList]);

  const hasError =
    typeof orgError !== 'undefined' ||
    typeof clusterError !== 'undefined' ||
    typeof providerClusterError !== 'undefined' ||
    typeof nodePoolListError !== 'undefined';

  const isLoadingResources =
    typeof org === 'undefined' &&
    typeof orgError === 'undefined' &&
    typeof cluster === 'undefined' &&
    typeof clusterError === 'undefined' &&
    typeof providerCluster === 'undefined' &&
    typeof providerClusterError === 'undefined' &&
    typeof nodePoolList === 'undefined' &&
    typeof nodePoolListError === 'undefined' &&
    typeof appList === 'undefined' &&
    typeof appListError === 'undefined';

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!cluster) return;

    setIsDeleting(true);

    try {
      await deleteClusterResources(clientFactory, auth, cluster);

      // Success message and redirection are handled by the parent component.
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);

      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        (
          <>
            Could not delete cluster <code>{cluster.metadata.name}</code>:
          </>
        ),
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      setIsDeleting(false);
    }
  };

  const isLoading = isLoadingResources || isDeleting;

  const name = cluster?.metadata.name ?? '';
  const description =
    cluster && providerCluster
      ? getClusterDescription(cluster, providerCluster)
      : '';
  const creationDate = cluster?.metadata.creationTimestamp ?? '';

  const workerNodePoolsCount = nodePoolList?.items.length ?? 0;
  const workerNodesCount = getWorkerNodesCount(nodePoolList?.items) ?? 0;

  return (
    <DocumentTitle title={`Actions | ${clusterId}`}>
      <Breadcrumb
        data={{
          title: 'ACTIONS',
          pathname,
        }}
      >
        <Box {...props}>
          <Box direction='row' align='baseline' wrap={true}>
            <Box
              basis='1/4'
              width={{ min: '250px' }}
              flex={{ grow: 1, shrink: 0 }}
            >
              <Heading level={2} margin='none'>
                Delete cluster
              </Heading>
            </Box>
            <ClusterDetailDeleteAction
              name={name}
              description={description}
              creationDate={creationDate}
              workerNodesCount={workerNodesCount}
              nodePoolsCount={workerNodePoolsCount}
              userInstalledAppsCount={userInstalledApps?.length}
              onDelete={handleDelete}
              isLoading={isLoading}
              disabled={hasError}
              canDeleteClusters={canDeleteClusters}
              variant={ClusterDetailDeleteActionNameVariant.Name}
              basis='3/4'
              flex={{ grow: 1, shrink: 0 }}
            />
          </Box>
          {cluster && (
            <Box
              margin={{ top: 'large' }}
              direction='column'
              gap='small'
              basis='100%'
              animation={{ type: 'fadeIn', duration: 300 }}
            >
              <DeleteClusterGuide
                clusterName={name}
                namespace={namespace!}
                provider={provider}
                canDeleteClusters={canDeleteClusters}
              />
            </Box>
          )}
        </Box>
      </Breadcrumb>
    </DocumentTitle>
  );
};

export default ClusterDetailActions;
