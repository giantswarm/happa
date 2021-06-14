import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import * as docs from 'lib/docs';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import * as appsUtils from 'MAPI/apps/utils';
import * as keyPairsUtils from 'MAPI/keypairs/utils';
import {
  extractErrorMessage,
  getOrgNamespaceFromOrgName,
} from 'MAPI/organizations/utils';
import {
  fetchNodePoolListForCluster,
  fetchNodePoolListForClusterKey,
  fetchProviderNodePoolsForNodePools,
  fetchProviderNodePoolsForNodePoolsKey,
  getMachineTypes,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as legacyKeyPairs from 'model/services/mapi/legacy/keypairs';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router';
import {
  AppsRoutes,
  MainRoutes,
  OrganizationsRoutes,
} from 'shared/constants/routes';
import useSWR, { mutate } from 'swr';
import UIClusterDetailOverview from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailOverview';

import {
  getWorkerNodesCount,
  getWorkerNodesCPU,
  getWorkerNodesMemory,
} from '../utils';
import { deleteCluster } from './utils';

const ClusterDetailOverview: React.FC<{}> = () => {
  const match = useRouteMatch<{ orgId: string; clusterId: string }>();
  const { orgId, clusterId } = match.params;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const namespace = getOrgNamespaceFromOrgName(orgId);

  const clusterClient = useRef(clientFactory());
  // The error is handled in the parent component.
  const { data: cluster, mutate: mutateCluster } = useSWR<
    capiv1alpha3.ICluster,
    GenericResponseError
  >(capiv1alpha3.getClusterKey(namespace, clusterId), () =>
    capiv1alpha3.getCluster(clusterClient.current, auth, namespace, clusterId)
  );

  const dispatch = useDispatch();

  const handleDelete = async () => {
    if (!cluster) return Promise.resolve();

    try {
      const client = clientFactory();

      const updatedCluster = await deleteCluster(
        client,
        auth,
        cluster.metadata.namespace!,
        cluster.metadata.name
      );

      new FlashMessage(
        `Cluster ${updatedCluster.metadata.name} deleted successfully.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );

      dispatch(push(MainRoutes.Home));

      mutateCluster(updatedCluster);
      mutate(
        capiv1alpha3.getClusterListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1alpha3.labelOrganization]: orgId,
            },
          },
        })
      );

      return Promise.resolve();
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err);

      return Promise.reject(new Error(errorMessage));
    }
  };

  const description = cluster
    ? capiv1alpha3.getClusterDescription(cluster)
    : undefined;
  const releaseVersion = cluster
    ? capiv1alpha3.getReleaseVersion(cluster)
    : undefined;
  const k8sApiURL = cluster
    ? capiv1alpha3.getKubernetesAPIEndpointURL(cluster)
    : undefined;

  const gettingStartedPath = useMemo(
    () =>
      RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.GettingStarted.Overview,
        { orgId, clusterId }
      ),
    [orgId, clusterId]
  );

  const {
    data: nodePoolList,
    error: nodePoolListError,
  } = useSWR(fetchNodePoolListForClusterKey(cluster), () =>
    fetchNodePoolListForCluster(clientFactory, auth, cluster)
  );

  useEffect(() => {
    if (nodePoolListError) {
      ErrorReporter.getInstance().notify(nodePoolListError);
    }
  }, [nodePoolListError]);

  const {
    data: providerNodePools,
    error: providerNodePoolsError,
  } = useSWR(fetchProviderNodePoolsForNodePoolsKey(nodePoolList?.items), () =>
    fetchProviderNodePoolsForNodePools(clientFactory, auth, nodePoolList!.items)
  );

  useEffect(() => {
    if (providerNodePoolsError) {
      ErrorReporter.getInstance().notify(providerNodePoolsError);
    }
  }, [providerNodePoolsError]);

  const machineTypes = useRef(getMachineTypes());

  const nodePoolsError = nodePoolListError ?? providerNodePoolsError;

  const workerNodePoolsCount = nodePoolListError
    ? -1
    : nodePoolList?.items.length;
  const workerNodesCount = nodePoolsError
    ? -1
    : getWorkerNodesCount(nodePoolList?.items);
  const workerNodesCPU = nodePoolsError
    ? -1
    : getWorkerNodesCPU(
        nodePoolList?.items,
        providerNodePools,
        machineTypes.current
      );
  const workerNodesMemory = nodePoolsError
    ? -1
    : getWorkerNodesMemory(
        nodePoolList?.items,
        providerNodePools,
        machineTypes.current
      );

  const workerNodesPath = useMemo(
    () =>
      RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.Detail.WorkerNodes,
        { orgId, clusterId }
      ),
    [orgId, clusterId]
  );

  const appListClient = useRef(clientFactory());
  const appListGetOptions = { namespace: clusterId };
  const { data: appList, error: appListError } = useSWR<
    applicationv1alpha1.IAppList,
    GenericResponseError
  >(applicationv1alpha1.getAppListKey(appListGetOptions), () =>
    applicationv1alpha1.getAppList(
      appListClient.current,
      auth,
      appListGetOptions
    )
  );

  useEffect(() => {
    if (appListError) {
      ErrorReporter.getInstance().notify(appListError);
    }
  }, [appListError]);

  const appCounters = useMemo(() => {
    if (appListError) {
      return {
        apps: -1,
        uniqueApps: -1,
        deployed: -1,
      };
    }

    if (!appList) {
      return {
        apps: undefined,
        uniqueApps: undefined,
        deployed: undefined,
      };
    }

    const userInstalledApps = appsUtils.filterUserInstalledApps(
      appList.items,
      true
    );

    return appsUtils.computeAppsCategorizedCounters(userInstalledApps);
  }, [appList, appListError]);

  const keyPairListClient = useRef(clientFactory());
  const { data: keyPairList, error: keyPairListError } = useSWR<
    legacyKeyPairs.IKeyPairList,
    GenericResponseError
  >(legacyKeyPairs.getKeyPairListKey(clusterId), () =>
    legacyKeyPairs.getKeyPairList(keyPairListClient.current, auth, clusterId)
  );

  useEffect(() => {
    if (keyPairListError) {
      ErrorReporter.getInstance().notify(keyPairListError);
    }
  }, [keyPairListError]);

  const activeKeyPairsCount = useMemo(() => {
    if (keyPairListError) return -1;
    if (!keyPairList) return undefined;

    return keyPairList.items.filter(keyPairsUtils.isKeyPairActive).length;
  }, [keyPairList, keyPairListError]);

  return (
    <UIClusterDetailOverview
      onDelete={handleDelete}
      gettingStartedPath={gettingStartedPath}
      workerNodesPath={workerNodesPath}
      appsPath={AppsRoutes.Home}
      createKeyPairPath={docs.gsctlCreateKubeconfigURL}
      name={cluster?.metadata.name}
      namespace={cluster?.metadata.namespace}
      description={description}
      creationDate={cluster?.metadata.creationTimestamp}
      deletionDate={cluster?.metadata.deletionTimestamp ?? null}
      releaseVersion={releaseVersion}
      workerNodePoolsCount={workerNodePoolsCount}
      workerNodesCount={workerNodesCount}
      workerNodesCPU={workerNodesCPU}
      workerNodesMemory={workerNodesMemory}
      appsCount={appCounters.apps}
      appsUniqueCount={appCounters.uniqueApps}
      appsDeployedCount={appCounters.deployed}
      activeKeyPairsCount={activeKeyPairsCount}
      k8sApiURL={k8sApiURL}
    />
  );
};

ClusterDetailOverview.propTypes = {};

export default ClusterDetailOverview;
