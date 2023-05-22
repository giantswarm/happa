import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import { usePermissionsForApps } from 'MAPI/apps/permissions/usePermissionsForApps';
import { findDefaultAppsBundle, getChildApps } from 'MAPI/apps/utils';
import { Cluster, ControlPlaneNode } from 'MAPI/types';
import {
  extractErrorMessage,
  fetchCluster,
  fetchClusterKey,
  fetchControlPlaneNodesForCluster,
  fetchControlPlaneNodesForClusterKey,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { OrganizationsRoutes } from 'model/constants/routes';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
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
  controlPlaneNodes: ControlPlaneNode[] = []
) {
  const stats = computeControlPlaneNodesStats(controlPlaneNodes);

  const status =
    stats.readyCount > 0
      ? ClusterCreationStatus.Ok
      : cluster
      ? ClusterCreationStatus.InProgress
      : ClusterCreationStatus.Waiting;

  return getStatusComponent(status);
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

  const childApps = getChildApps(appList.items, defaultAppsBundle);
  const deployedApps = childApps.filter((app) => {
    const appStatus = applicationv1alpha1.getAppStatus(app);

    return appStatus === applicationv1alpha1.statusDeployed;
  });

  if (deployedApps.length > 0 && deployedApps.length === childApps.length) {
    return getStatusComponent(ClusterCreationStatus.Ok);
  }

  if (deployedApps.length > 0) {
    return getStatusComponent(
      ClusterCreationStatus.InProgress,
      childApps.length,
      deployedApps.length
    );
  }

  return getStatusComponent(ClusterCreationStatus.InProgress);
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

        return cluster?.status?.controlPlaneReady === true
          ? 0
          : REFRESH_INTERVAL;
      },
    }
  );

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

  const clusterAppCreated = getClusterAppCreatedStatus(clusterApp);
  const clusterCreated = getClusterCreatedStatus(cluster, clusterApp);
  const controlPlaneReady = getControlPlaneReadyStatus(
    cluster,
    controlPlaneNodes
  );
  const clusterAppDeployed = getClusterAppDeployedStatus(clusterApp);
  const defaultAppsDeployed = getDefaultAppsDeployedStatus(appList);

  const clusterPath = useMemo(() => {
    if (!orgId || !clusterId) return '';

    return RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      { orgId, clusterId }
    );
  }, [orgId, clusterId]);

  const error = useMemo(() => {
    const errors = [
      clusterAppError,
      clusterError,
      controlPlaneNodesError,
      appListError,
    ].filter((err) => {
      return (
        err &&
        !metav1.isStatusError(err.data, metav1.K8sStatusErrorReasons.NotFound)
      );
    });

    return errors.length > 0 ? errors[0] : undefined;
  }, [clusterAppError, clusterError, controlPlaneNodesError, appListError]);

  return (
    <Box {...props}>
      <Box
        width={{ max: CLUSTER_CREATION_PROGRESS_MAX_WIDTH }}
        margin={{ bottom: 'medium' }}
      >
        <StatusList>
          <StatusListItem status={clusterAppCreated}>
            Cluster app resources created
          </StatusListItem>
          <StatusListItem status={clusterCreated}>
            Cluster resource created
          </StatusListItem>
          <StatusListItem status={controlPlaneReady}>
            Control plane ready
          </StatusListItem>
          <StatusListItem status={clusterAppDeployed}>
            Cluster app bundle deployed
          </StatusListItem>
          <StatusListItem status={defaultAppsDeployed}>
            Default apps bundle deployed
          </StatusListItem>
        </StatusList>
      </Box>

      {error && (
        <Box
          border={{ side: 'top' }}
          margin={{ top: 'medium' }}
          pad={{ top: 'medium' }}
        >
          <ErrorMessage
            width={{ max: CLUSTER_CREATION_FORM_MAX_WIDTH }}
            details={extractErrorMessage(error)}
          >
            An error occurred during creation of the cluster. If you want to
            contact Giant Swarm support for assistance, please provide the
            details given below.
          </ErrorMessage>
        </Box>
      )}

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
