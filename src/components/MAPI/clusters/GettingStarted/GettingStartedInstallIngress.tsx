import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Heading, Paragraph } from 'grommet';
import InstallIngressButton from 'MAPI/apps/InstallIngressButton';
import { usePermissionsForClusters } from 'MAPI/clusters/permissions/usePermissionsForClusters';
import { hasClusterAppLabel } from 'MAPI/clusters/utils';
import { Cluster } from 'MAPI/types';
import { extractErrorMessage, fetchCluster, fetchClusterKey } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import React, { useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useRouteMatch } from 'react-router';
import useSWR from 'swr';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClient } from 'utils/hooks/useHttpClient';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

interface IGettingStartedInstallIngressProps {}

const GettingStartedInstallIngress: React.FC<
  React.PropsWithChildren<IGettingStartedInstallIngressProps>
> = () => {
  const provider = window.config.info.general.provider;
  const match = useRouteMatch<{ orgId: string; clusterId: string }>();
  const { clusterId, orgId } = match.params;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const orgClient = useHttpClient();
  const orgKey = securityv1alpha1.getOrganizationKey(orgId);
  const {
    data: org,
    error: orgError,
    isLoading: orgIsLoading,
  } = useSWR<securityv1alpha1.IOrganization, GenericResponseError>(orgKey, () =>
    securityv1alpha1.getOrganization(orgClient, auth, orgId)
  );

  useEffect(() => {
    if (orgError) {
      ErrorReporter.getInstance().notify(orgError);

      new FlashMessage(
        'There was a problem fetching an organization resource.',
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(orgError)
      );
    }
  }, [orgError]);

  const namespace = org?.status?.namespace;

  const { canGet: canGetClusters } = usePermissionsForClusters(
    provider,
    namespace ?? ''
  );

  const clusterKey =
    canGetClusters && namespace
      ? fetchClusterKey(provider, namespace, clusterId)
      : null;

  const {
    data: cluster,
    error: clusterError,
    isLoading: clusterIsLoading,
  } = useSWR<Cluster, GenericResponseError>(clusterKey, () =>
    fetchCluster(clientFactory, auth, provider, namespace!, clusterId)
  );

  useEffect(() => {
    if (clusterError) {
      ErrorReporter.getInstance().notify(clusterError);

      new FlashMessage(
        'There was a problem fetching a cluster resource.',
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(clusterError)
      );
    }
  }, [clusterError]);

  const isClusterApp = cluster ? hasClusterAppLabel(cluster) : undefined;

  const appsNamespace =
    typeof isClusterApp === 'undefined'
      ? undefined
      : isClusterApp
      ? namespace
      : clusterId;

  const hasError =
    typeof orgError !== 'undefined' || typeof clusterError !== 'undefined';

  const isLoadingResources = orgIsLoading && clusterIsLoading;

  return (
    <Breadcrumb
      data={{
        title: 'INSTALL INGRESS',
        pathname: match.url,
      }}
    >
      <Box>
        <Heading level={1}>Install an ingress controller</Heading>
        <Paragraph fill={true}>
          Your cluster does not come with an ingress controller installed by
          default. Without an ingress controller you won&apos;t be able to
          access any services running on the cluster from the browser.
        </Paragraph>
        <Heading level={2}>Using the Giant Swarm App Platform</Heading>
        <Paragraph fill={true}>
          You can use our app platform to install the popular nginx ingress
          controller. We provide a tuned implementation in the &quot;Giant Swarm
          Catalog&quot;, which you can browse by clicking on &quot;Apps&quot; in
          the navigation above.
        </Paragraph>
        <Paragraph fill={true}>
          For convenience however, you can click on the &apos;Install ingress
          controller&apos; button below to immediately install the nginx ingress
          controller on your cluster.
        </Paragraph>
        {!isLoadingResources && !hasError && (
          <InstallIngressButton
            clusterID={clusterId}
            appsNamespace={appsNamespace!}
            isClusterApp={isClusterApp!}
          />
        )}
      </Box>
    </Breadcrumb>
  );
};

export default GettingStartedInstallIngress;
