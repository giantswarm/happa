import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box } from 'grommet';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import {
  extractErrorMessage,
  getOrgNamespaceFromOrgName,
} from 'MAPI/organizations/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router';
import { MainRoutes } from 'shared/constants/routes';
import useSWR, { mutate } from 'swr';
import ClusterDetailOverviewDelete from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailOverviewDelete';

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

  return (
    <Box>
      {cluster && (
        <ClusterDetailOverviewDelete
          clusterName={cluster.metadata.name}
          onDelete={handleDelete}
          border='top'
          margin={{ top: 'medium' }}
        />
      )}
    </Box>
  );
};

ClusterDetailOverview.propTypes = {};

export default ClusterDetailOverview;
