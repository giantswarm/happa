import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import { usePermissionsForApps } from 'MAPI/apps/permissions/usePermissionsForApps';
import {
  findDefaultAppsBundle,
  getAllChildApps,
  isAppBundle,
} from 'MAPI/apps/utils';
import { Cluster, ControlPlaneNode, NodePoolList } from 'MAPI/types';
import {
  extractErrorMessage,
  fetchCluster,
  fetchClusterKey,
  fetchControlPlaneNodesForCluster,
  fetchControlPlaneNodesForClusterKey,
  fetchNodePoolListForCluster,
  fetchNodePoolListForClusterKey,
} from 'MAPI/utils';
import { usePermissionsForNodePools } from 'MAPI/workernodes/permissions/usePermissionsForNodePools';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { OrganizationsRoutes } from 'model/constants/routes';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as metav1 from 'model/services/mapi/metav1';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ErrorMessage from 'UI/Display/ErrorMessage';
import ClusterCreationStatusComponent, {
  ClusterCreationStatus,
} from 'UI/Display/MAPI/clusters/ClusterCreationStatus';
import StatusList from 'UI/Display/StatusList';
import StatusListItem from 'UI/Display/StatusList/StatusListItem';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import RoutePath from 'utils/routePath';

import { computeControlPlaneNodesStats } from '../ClusterDetail/utils';
import { usePermissionsForClusters } from '../permissions/usePermissionsForClusters';
import { usePermissionsForCPNodes } from '../permissions/usePermissionsForCPNodes';
import { CLUSTER_CREATION_FORM_MAX_WIDTH } from '.';
import {
  formatClusterAppResourcesError,
  getControlPlaneNodesErrors,
  getNodePoolsErrors,
} from './utils';

const CLUSTER_CREATION_PROGRESS_MAX_WIDTH = '650px';

// eslint-disable-next-line no-magic-numbers
const REFRESH_INTERVAL = 10 * 1000; // 10 seconds

function getStatusComponent(
  status: ClusterCreationStatus,
  totalCount?: number,
  readyCount?: number
) {
  return (
    <ClusterCreationStatusComponent
      status={status}
      totalCount={totalCount}
      readyCount={readyCount}
    />
  );
}

function getClusterAppCreatedStatus(clusterApp?: applicationv1alpha1.IApp) {
  const status = clusterApp
    ? ClusterCreationStatus.Ok
    : ClusterCreationStatus.Waiting;

  return getStatusComponent(status);
}

function getClusterCreatedStatus(
  cluster?: Cluster,
  clusterApp?: applicationv1alpha1.IApp
) {
  const status = cluster
    ? ClusterCreationStatus.Ok
    : clusterApp
    ? ClusterCreationStatus.InProgress
    : ClusterCreationStatus.Waiting;

  return getStatusComponent(status);
}

function getControlPlaneReadyStatus(
  cluster?: Cluster,
  controlPlaneNodes: ControlPlaneNode[] = [],
  errors: boolean = false
) {
  if (typeof cluster === 'undefined') {
    return getStatusComponent(ClusterCreationStatus.Waiting);
  }

  if (errors) {
    return getStatusComponent(ClusterCreationStatus.Failed);
  }

  const stats = computeControlPlaneNodesStats(controlPlaneNodes);

  if (stats.totalCount > 0 && stats.readyCount === stats.totalCount) {
    return getStatusComponent(ClusterCreationStatus.Ok);
  }

  return getStatusComponent(ClusterCreationStatus.InProgress);
}

function getClusterAppDeployedStatus(clusterApp?: applicationv1alpha1.IApp) {
  if (typeof clusterApp === 'undefined') {
    return getStatusComponent(ClusterCreationStatus.Waiting);
  }

  const appStatus = applicationv1alpha1.getAppStatus(clusterApp);

  const status =
    appStatus === applicationv1alpha1.statusDeployed
      ? ClusterCreationStatus.Ok
      : appStatus === applicationv1alpha1.statusFailed
      ? ClusterCreationStatus.Failed
      : ClusterCreationStatus.InProgress;

  return getStatusComponent(status);
}

function getDefaultAppsDeployedStatus(appList?: applicationv1alpha1.IAppList) {
  if (typeof appList === 'undefined') {
    return getStatusComponent(ClusterCreationStatus.Waiting);
  }

  const provider = window.config.info.general.provider;
  const defaultAppsBundle = findDefaultAppsBundle(appList.items, provider);
  if (typeof defaultAppsBundle === 'undefined') {
    return getStatusComponent(ClusterCreationStatus.Waiting);
  }

  const childApps = getAllChildApps(appList.items, defaultAppsBundle).filter(
    (app) => !isAppBundle(app)
  );

  if (childApps.length === 0) {
    return getStatusComponent(ClusterCreationStatus.InProgress);
  }

  const deployedApps = childApps.filter((app) => {
    const appStatus = applicationv1alpha1.getAppStatus(app);

    return appStatus === applicationv1alpha1.statusDeployed;
  });

  if (deployedApps.length > 0 && deployedApps.length === childApps.length) {
    return getStatusComponent(ClusterCreationStatus.Ok);
  }

  return getStatusComponent(
    ClusterCreationStatus.InProgress,
    childApps.length,
    deployedApps.length
  );
}

function getNodePoolsAvailableStatus(nodePools?: NodePoolList) {
  if (typeof nodePools === 'undefined' || nodePools.items.length === 0) {
    return getStatusComponent(ClusterCreationStatus.Waiting);
  }

  return getStatusComponent(ClusterCreationStatus.Ok);
}

function getNodePoolInfrastructureReadyStatus(
  nodePool: capiv1beta1.IMachinePool
) {
  const infrastructureReadyCondition = capiv1beta1.getCondition(
    nodePool,
    'InfrastructureReady'
  );
  if (infrastructureReadyCondition?.severity === 'Error') {
    return getStatusComponent(ClusterCreationStatus.Failed);
  }

  if (!nodePool.status?.infrastructureReady) {
    return getStatusComponent(ClusterCreationStatus.Waiting);
  }

  return getStatusComponent(ClusterCreationStatus.Ok);
}

interface StatusError {
  error?: string;
  details?: string;
}

interface ICreateClusterAppBundlesStatusProps {}

const CreateClusterAppBundlesStatus: React.FC<
  React.PropsWithChildren<ICreateClusterAppBundlesStatusProps>
> = ({ ...props }) => {
  const match = useRouteMatch<{
    orgId: string;
    clusterId: string;
  }>();
  const { orgId, clusterId } = match.params;
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = orgId ? organizations[orgId] : undefined;

  const provider = window.config.info.general.provider;

  const namespace = selectedOrg?.namespace ?? '';

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appsPermissions = usePermissionsForApps(provider, namespace, true);
  const clusterAppClient = useRef(clientFactory());
  const clusterAppKey = appsPermissions.canGet
    ? applicationv1alpha1.getAppKey(namespace, clusterId)
    : null;
  const { data: clusterApp, error: clusterAppError } = useSWR<
    applicationv1alpha1.IApp,
    GenericResponseError
  >(
    clusterAppKey,
    () =>
      applicationv1alpha1.getApp(
        clusterAppClient.current,
        auth,
        namespace,
        clusterId
      ),
    {
      refreshInterval: (latestData) => {
        if (typeof latestData === 'undefined') {
          return REFRESH_INTERVAL;
        }

        const appStatus = applicationv1alpha1.getAppStatus(latestData);

        return appStatus === applicationv1alpha1.statusFailed ||
          appStatus === applicationv1alpha1.statusDeployed
          ? 0
          : REFRESH_INTERVAL;
      },
    }
  );

  const clusterPermissions = usePermissionsForClusters(provider, namespace);
  const clusterKey =
    clusterApp && clusterPermissions.canGet
      ? fetchClusterKey(provider, namespace, clusterId)
      : null;

  const { data: cluster, error: clusterError } = useSWR<
    Cluster,
    GenericResponseError
  >(
    clusterKey,
    () => fetchCluster(clientFactory, auth, provider, namespace, clusterId),
    {
      refreshInterval: (latestData) => {
        return typeof latestData === 'undefined' ? REFRESH_INTERVAL : 0;
      },
    }
  );

  const { canList } = usePermissionsForCPNodes(
    provider,
    cluster?.metadata.namespace ?? ''
  );

  const controlPlaneNodesKey =
    cluster && canList ? fetchControlPlaneNodesForClusterKey(cluster) : null;

  const { data: controlPlaneNodes, error: controlPlaneNodesError } = useSWR<
    ControlPlaneNode[],
    GenericResponseError
  >(
    controlPlaneNodesKey,
    () => fetchControlPlaneNodesForCluster(clientFactory, auth, cluster!),
    {
      refreshInterval: (latestData) => {
        if (typeof latestData === 'undefined') {
          return REFRESH_INTERVAL;
        }

        const stats = computeControlPlaneNodesStats(latestData);

        return stats.totalCount > 0 && stats.readyCount === stats.totalCount
          ? 0
          : REFRESH_INTERVAL;
      },
    }
  );

  const controlPlaneNodesErrors = useMemo(() => {
    if (typeof controlPlaneNodes === 'undefined') {
      return [];
    }

    return getControlPlaneNodesErrors(controlPlaneNodes, provider);
  }, [controlPlaneNodes, provider]);

  const appListClient = useRef(clientFactory());
  const appListGetOptions = {
    namespace,
    labelSelector: {
      matchingLabels: {
        [applicationv1alpha1.labelCluster]: clusterId,
      },
    },
  };

  const appListKey = appsPermissions.canList
    ? applicationv1alpha1.getAppListKey(appListGetOptions)
    : null;

  const { data: appList, error: appListError } = useSWR<
    applicationv1alpha1.IAppList,
    GenericResponseError
  >(
    appListKey,
    () =>
      applicationv1alpha1.getAppList(
        appListClient.current,
        auth,
        appListGetOptions
      ),
    {
      refreshInterval: (latestData) => {
        if (
          typeof latestData === 'undefined' ||
          typeof latestData.items === 'undefined'
        ) {
          return REFRESH_INTERVAL;
        }

        const notDeployedApps = latestData.items.filter((app) => {
          const appStatus = applicationv1alpha1.getAppStatus(app);

          return appStatus !== applicationv1alpha1.statusDeployed;
        });

        return notDeployedApps.length > 0 ? REFRESH_INTERVAL : 0;
      },
    }
  );

  const nodePoolsPermissions = usePermissionsForNodePools(
    provider,
    cluster?.metadata.namespace ?? ''
  );

  const nodePoolListForClusterKey =
    cluster && nodePoolsPermissions.canList && nodePoolsPermissions.canGet
      ? fetchNodePoolListForClusterKey(cluster, cluster.metadata.namespace)
      : null;

  const { data: nodePoolList, error: nodePoolListError } = useSWR<
    NodePoolList,
    GenericResponseError
  >(
    nodePoolListForClusterKey,
    () =>
      fetchNodePoolListForCluster(
        clientFactory,
        auth,
        cluster,
        cluster!.metadata.namespace
      ),
    {
      refreshInterval: (latestData) => {
        if (
          typeof latestData === 'undefined' ||
          typeof latestData.items === 'undefined'
        ) {
          return REFRESH_INTERVAL;
        }

        if (
          latestData.items.some(
            (item) =>
              item.kind === 'MachinePool' && !item.status?.infrastructureReady
          )
        ) {
          return REFRESH_INTERVAL;
        }

        return 0;
      },
    }
  );

  const nodePoolsErrors = useMemo(() => {
    if (typeof nodePoolList === 'undefined') {
      return [];
    }

    return getNodePoolsErrors(nodePoolList, provider);
  }, [nodePoolList, provider]);

  const clusterAppCreated = getClusterAppCreatedStatus(clusterApp);
  const clusterCreated = getClusterCreatedStatus(cluster, clusterApp);
  const controlPlaneReady = getControlPlaneReadyStatus(
    cluster,
    controlPlaneNodes,
    controlPlaneNodesErrors.length > 0
  );
  const clusterAppDeployed = getClusterAppDeployedStatus(clusterApp);
  const defaultAppsDeployed = getDefaultAppsDeployedStatus(appList);
  const nodePoolsAvailable = getNodePoolsAvailableStatus(nodePoolList);

  const clusterPath = useMemo(() => {
    if (!orgId || !clusterId) return '';

    return RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      { orgId, clusterId }
    );
  }, [orgId, clusterId]);

  const errors = useMemo(() => {
    const requestErrors = [
      clusterAppError,
      clusterError,
      controlPlaneNodesError,
      appListError,
      nodePoolListError,
    ]
      .filter((err): err is GenericResponseError => {
        return Boolean(
          err &&
            !metav1.isStatusError(
              err.data,
              metav1.K8sStatusErrorReasons.NotFound
            )
        );
      })
      .map(
        (error): StatusError => ({
          details: extractErrorMessage(error),
        })
      );

    return [...requestErrors, ...nodePoolsErrors, ...controlPlaneNodesErrors];
  }, [
    clusterAppError,
    clusterError,
    controlPlaneNodesError,
    appListError,
    nodePoolListError,
    nodePoolsErrors,
    controlPlaneNodesErrors,
  ]);

  console.log('cluster', cluster);
  console.log('control plane nodes', controlPlaneNodes);
  console.log('node pools', nodePoolList);

  return (
    <Box {...props}>
      <Box
        width={{ max: CLUSTER_CREATION_PROGRESS_MAX_WIDTH }}
        margin={{ bottom: 'medium' }}
      >
        <StatusList>
          <StatusListItem
            status={clusterAppCreated}
            info='When done, all App and ConfigMap resources for this workload are created in the management cluster.'
          >
            Cluster app resources created
          </StatusListItem>
          <StatusListItem
            status={clusterCreated}
            info='When done, the main Cluster API resource defining this cluster is available.'
          >
            Cluster resource created
          </StatusListItem>
          <StatusListItem
            status={clusterAppDeployed}
            info='When done, the App defining this cluster is deployed successfully by the app platform.'
          >
            Cluster app deployed
          </StatusListItem>
          <StatusListItem
            status={controlPlaneReady}
            info='Tracks the control plane node(s) becoming available ("Ready" state). The Kubernetes API of the cluster should be reachable shortly after the first node is ready.'
          >
            Control plane nodes ready
          </StatusListItem>

          <StatusListItem
            status={defaultAppsDeployed}
            info='Counts up the deployment of all apps that are installed via the default apps bundle.'
          >
            Default apps deployed
          </StatusListItem>
        </StatusList>

        <StatusList title='Node pools' margin={{ top: 'large' }}>
          <StatusListItem
            status={nodePoolsAvailable}
            info='We look for node pool related resources.'
          >
            Node pool information is available
          </StatusListItem>
          {nodePoolList && nodePoolList.items.length > 0
            ? nodePoolList.items.map((nodePool) => (
                <StatusList key={nodePool.metadata.name}>
                  <StatusListItem
                    status={getStatusComponent(ClusterCreationStatus.Ok)}
                    info={`When done, the main Cluster API resource for this particular node pool got created.${
                      nodePool.kind !== 'MachinePool'
                        ? ' After that it will still take time until node become available.'
                        : ''
                    }`}
                  >
                    Node pool <code>{nodePool.metadata.name}</code>{' '}
                    {nodePool.kind} resource created
                  </StatusListItem>
                  {nodePool.kind === 'MachinePool' ? (
                    <StatusListItem
                      status={getNodePoolInfrastructureReadyStatus(nodePool)}
                      info='When done, the infrastructure provider reports this node pool as ready.'
                    >
                      Node pool <code>{nodePool.metadata.name}</code>{' '}
                      {nodePool.kind} reports infrastructure ready
                    </StatusListItem>
                  ) : null}
                </StatusList>
              ))
            : null}
        </StatusList>
      </Box>

      {errors &&
        errors.map((error, idx) => (
          <Box
            key={idx}
            border={{ side: 'top' }}
            margin={{ top: 'medium' }}
            pad={{ top: 'medium' }}
          >
            <ErrorMessage
              width={{ max: CLUSTER_CREATION_FORM_MAX_WIDTH }}
              error={
                error.error
                  ? formatClusterAppResourcesError(error.error)
                  : undefined
              }
              details={error.details}
            >
              An error occurred during creation of the cluster. If you want to
              contact Giant Swarm support for assistance, please provide the
              details given below.
            </ErrorMessage>
          </Box>
        ))}

      <Box
        border={{ side: 'top' }}
        margin={{ top: 'medium' }}
        pad={{ top: 'medium' }}
      >
        <Button
          href={clusterPath}
          primary={true}
          disabled={typeof cluster === 'undefined'}
        >
          Show cluster details
        </Button>
      </Box>
    </Box>
  );
};

export default CreateClusterAppBundlesStatus;
