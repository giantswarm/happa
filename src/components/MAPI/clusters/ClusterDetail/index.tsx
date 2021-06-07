import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Heading } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import {
  extractErrorMessage,
  getOrgNamespaceFromOrgName,
} from 'MAPI/organizations/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
import React, { useEffect, useMemo, useRef } from 'react';
import { Tab } from 'react-bootstrap';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch } from 'react-redux';
import { Switch, useRouteMatch } from 'react-router';
import Route from 'Route';
import { MainRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import Tabs from 'shared/Tabs';
import styled from 'styled-components';
import useSWR from 'swr';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import ClusterDetailWidgetOptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidgetOptionalValue';
import ViewAndEditName from 'UI/Inputs/ViewEditName';

import ClusterDetailOverview from './ClusterDetailOverview';
import { updateClusterDescription } from './utils';

function computePaths(orgName: string, clusterName: string) {
  return {
    Home: RoutePath.createUsablePath(OrganizationsRoutes.Clusters.Detail.Home, {
      orgId: orgName,
      clusterId: clusterName,
    }),
  };
}

const StyledViewAndEditName = styled(ViewAndEditName)`
  input {
    font-size: 100%;
  }
`;

const ClusterDetail: React.FC<{}> = () => {
  const dispatch = useDispatch();

  const match = useRouteMatch<{ orgId: string; clusterId: string }>();
  const { orgId, clusterId } = match.params;

  const paths = useMemo(() => computePaths(orgId, clusterId), [
    orgId,
    clusterId,
  ]);

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const namespace = getOrgNamespaceFromOrgName(orgId);

  const clusterClient = useRef(clientFactory());
  const { data: cluster, error: clusterError, mutate: mutateCluster } = useSWR<
    capiv1alpha3.ICluster,
    GenericResponseError
  >(capiv1alpha3.getClusterKey(namespace, clusterId), () =>
    capiv1alpha3.getCluster(clusterClient.current, auth, namespace, clusterId)
  );

  useEffect(() => {
    if (clusterError) {
      ErrorReporter.getInstance().notify(clusterError);
    }

    if (
      metav1.isStatusError(
        clusterError?.data,
        metav1.K8sStatusErrorReasons.NotFound
      )
    ) {
      new FlashMessage(
        `Cluster <code>${clusterId}</code> not found`,
        messageType.ERROR,
        messageTTL.FOREVER,
        'Please make sure the Cluster ID is correct and that you have access to it.'
      );

      dispatch(push(MainRoutes.Home));
    } else if (clusterError) {
      const errorMessage = extractErrorMessage(clusterError);
      new FlashMessage(
        `There was a problem loading cluster <code>${clusterId}</code>`,
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      if (!cluster) {
        dispatch(push(MainRoutes.Home));
      }
    }
  }, [cluster, clusterError, clusterId, dispatch]);

  useEffect(() => {
    if (typeof cluster?.metadata.deletionTimestamp !== 'undefined') {
      new FlashMessage(
        `Cluster <code>${cluster.metadata.name}</code> is currently being deleted`,
        messageType.INFO,
        messageTTL.MEDIUM
      );

      dispatch(push(MainRoutes.Home));
    }
  }, [cluster, dispatch]);

  const clusterDescription = cluster
    ? capiv1alpha3.getClusterDescription(cluster)
    : undefined;

  const updateDescription = async (newValue: string) => {
    if (!cluster) return;

    try {
      const updatedCluster = await updateClusterDescription(
        clientFactory(),
        auth,
        cluster.metadata.namespace!,
        cluster.metadata.name,
        newValue
      );

      mutateCluster(updatedCluster);

      new FlashMessage(
        `Successfully updated the cluster's description`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        `There was a problem updating the cluster's description`,
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err);
    }
  };

  return (
    <Breadcrumb
      data={{
        title: clusterId,
        pathname: match.url,
      }}
    >
      <Box>
        <Heading level={1} margin={{ bottom: 'large' }}>
          <Box direction='row' align='center'>
            <ClusterIDLabel clusterID={clusterId} copyEnabled={true} />{' '}
            <ClusterDetailWidgetOptionalValue
              value={clusterDescription}
              loaderHeight={35}
              loaderWidth={300}
            >
              {(value) => (
                <StyledViewAndEditName
                  value={value as string}
                  typeLabel='cluster'
                  onSave={updateDescription}
                  aria-label={value as string}
                />
              )}
            </ClusterDetailWidgetOptionalValue>
          </Box>
        </Heading>
        <Tabs defaultActiveKey={paths.Home} useRoutes={true}>
          <Tab eventKey={paths.Home} title='Overview' />
        </Tabs>
        <Switch>
          <Route
            path={OrganizationsRoutes.Clusters.Detail.Home}
            component={ClusterDetailOverview}
          />
        </Switch>
      </Box>
    </Breadcrumb>
  );
};

ClusterDetail.propTypes = {};

export default ClusterDetail;
