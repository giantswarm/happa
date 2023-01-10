import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import Instructions from 'Cluster/ClusterDetail/Ingress/Instructions';
import { Box, Text } from 'grommet';
import InstallIngressButton from 'MAPI/apps/InstallIngressButton';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { Providers } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect, useMemo } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router';
import DocumentTitle from 'shared/DocumentTitle';
import styled from 'styled-components';
import { FlashMessageType } from 'styles';
import useSWR, { KeyedMutator } from 'swr';
import FlashMessage from 'UI/Display/FlashMessage';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClient } from 'utils/hooks/useHttpClient';

import { usePermissionsForApps } from './permissions/usePermissionsForApps';
import { findIngressApp, getClusterK8sEndpoint } from './utils';

const IngressWrapper = styled.div``;

const StyledLoadingIndicator = styled(LoadingIndicator)`
  display: inline-block;

  img {
    display: inline-block;
    vertical-align: middle;
    width: 20px;
  }
`;

interface IClusterDetailIngressProps
  extends React.ComponentPropsWithoutRef<'div'> {
  provider?: PropertiesOf<typeof Providers>;
  cluster?: capiv1beta1.ICluster;
  isClusterApp?: boolean;
  k8sEndpoint?: string;
  kvmTCPHTTPPort?: number;
  kvmTCPHTTPSPort?: number;
  mutateCluster?: KeyedMutator<capiv1beta1.ICluster>;
}

const ClusterDetailIngress: React.FC<
  React.PropsWithChildren<IClusterDetailIngressProps>
  // eslint-disable-next-line complexity
> = ({
  cluster,
  isClusterApp,
  kvmTCPHTTPPort,
  kvmTCPHTTPSPort,
  mutateCluster,
  ...rest
}) => {
  const { pathname } = useLocation();
  const { clusterId, orgId } = useParams<{
    clusterId: string;
    orgId: string;
  }>();
  const provider = rest.provider ?? window.config.info.general.provider;
  const organizations = useSelector(selectOrganizations());

  const appsNamespace =
    typeof isClusterApp === 'undefined'
      ? undefined
      : isClusterApp
      ? organizations[orgId]?.namespace
      : clusterId;

  const auth = useAuthProvider();

  const appListClient = useHttpClient();
  const appsPermissions = usePermissionsForApps(
    provider,
    appsNamespace ?? '',
    isClusterApp
  );
  const appListGetOptions =
    typeof isClusterApp === 'undefined'
      ? undefined
      : isClusterApp
      ? {
          namespace: appsNamespace,
          labelSelector: {
            matchingLabels: {
              [applicationv1alpha1.labelCluster]: clusterId,
            },
          },
        }
      : { namespace: appsNamespace };

  const appListKey = appsPermissions.canList
    ? applicationv1alpha1.getAppListKey(appListGetOptions)
    : null;

  const {
    data: appList,
    error: appListError,
    isLoading: appListIsLoading,
  } = useSWR<applicationv1alpha1.IAppList, GenericResponseError>(
    appListKey,
    () => applicationv1alpha1.getAppList(appListClient, auth, appListGetOptions)
  );

  const isLoading =
    typeof appsPermissions.canList === 'undefined' || appListIsLoading;

  useEffect(() => {
    if (appListError) {
      ErrorReporter.getInstance().notify(appListError);
    }
  }, [appListError]);

  const hasIngress = useMemo(() => {
    const app = findIngressApp(appList?.items);

    return Boolean(app);
  }, [appList?.items]);

  const k8sEndpoint = useMemo(() => {
    if (rest.k8sEndpoint) {
      return rest.k8sEndpoint;
    }

    return cluster ? getClusterK8sEndpoint(cluster, provider) : undefined;
  }, [cluster, provider, rest.k8sEndpoint]);

  return (
    <DocumentTitle title={`Ingress | ${clusterId}`}>
      <Breadcrumb
        data={{
          title: 'INGRESS',
          pathname,
        }}
      >
        <IngressWrapper {...rest}>
          {isLoading && (
            <Box direction='row' align='center' gap='small'>
              <StyledLoadingIndicator loading={true} />
              <Text color='text-weak'>Loading ingress information…</Text>
            </Box>
          )}

          {!isLoading && !appListError && (
            <Box margin={{ bottom: 'medium' }}>
              {hasIngress ? (
                <Text>
                  These details help you to set up Ingress for exposing services
                  in this cluster.
                </Text>
              ) : (
                <Text>
                  In order to expose services via Ingress, you must have{' '}
                  <code>external-dns</code> and an Ingress controller installed.
                  Giant Swarm provides the NGINX Ingress Controller as a managed
                  app.
                </Text>
              )}
            </Box>
          )}

          {hasIngress && !isLoading && !appListError && (
            <Instructions
              provider={provider}
              k8sEndpoint={k8sEndpoint}
              kvmTCPHTTPPort={kvmTCPHTTPPort}
              kvmTCPHTTPSPort={kvmTCPHTTPSPort}
            />
          )}

          {!hasIngress && !isLoading && !appListError && (
            <InstallIngressButton
              clusterID={clusterId}
              appsNamespace={appsNamespace!}
              isClusterApp={isClusterApp!}
              mutateCluster={mutateCluster}
            />
          )}

          {appListError && (
            <FlashMessage type={FlashMessageType.Danger}>
              <Box>
                <Text weight='bold'>
                  There was a problem fetching apps installed on this cluster.
                </Text>
                <Text>{extractErrorMessage(appListError)}</Text>
              </Box>
            </FlashMessage>
          )}
        </IngressWrapper>
      </Breadcrumb>
    </DocumentTitle>
  );
};

ClusterDetailIngress.defaultProps = {
  kvmTCPHTTPPort: 0,
  kvmTCPHTTPSPort: 0,
};

export default ClusterDetailIngress;
