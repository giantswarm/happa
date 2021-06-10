import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import {
  extractErrorMessage,
  getOrgNamespaceFromOrgName,
} from 'MAPI/organizations/utils';
import { ControlPlaneNodeList } from 'MAPI/types';
import {
  fetchMasterListForCluster,
  fetchMasterListForClusterKey,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router';
import { MainRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import useSWR, { mutate } from 'swr';
import UIClusterDetailOverview from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailOverview';

import {
  deleteCluster,
  mapControlPlaneNodeToUIControlPlaneNode,
} from './utils';

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

  const controlPlaneNodesKey = cluster
    ? fetchMasterListForClusterKey(cluster)
    : null;
  const { data: controlPlaneNodes, error: controlPlaneNodesError } = useSWR<
    ControlPlaneNodeList,
    GenericResponseError
  >(controlPlaneNodesKey, () =>
    fetchMasterListForCluster(clientFactory, auth, cluster!)
  );

  useEffect(() => {
    if (controlPlaneNodesError) {
      ErrorReporter.getInstance().notify(controlPlaneNodesError);
    }
  }, [controlPlaneNodesError]);

  const controlPlaneNodeCollection = useMemo(() => {
    if (typeof controlPlaneNodes === 'undefined') return undefined;

    return controlPlaneNodes.items.map(mapControlPlaneNodeToUIControlPlaneNode);
  }, [controlPlaneNodes]);

  return (
    <UIClusterDetailOverview
      onDelete={handleDelete}
      gettingStartedPath={gettingStartedPath}
      name={cluster?.metadata.name}
      namespace={cluster?.metadata.namespace}
      description={description}
      creationDate={cluster?.metadata.creationTimestamp}
      deletionDate={cluster?.metadata.deletionTimestamp ?? null}
      releaseVersion={releaseVersion}
      k8sApiURL={k8sApiURL}
      controlPlaneNodes={controlPlaneNodeCollection}
      controlPlaneNodesError={extractErrorMessage(controlPlaneNodesError)}
    />
  );
};

ClusterDetailOverview.propTypes = {};

export default ClusterDetailOverview;
