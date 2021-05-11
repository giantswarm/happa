import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import Instructions from 'Cluster/ClusterDetail/Ingress/Instructions';
import { Box, Text } from 'grommet';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import InstallIngressButton from 'MAPI/apps/InstallIngressButton';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import styled from 'styled-components';
import useSWR from 'swr';

import { findIngressApp } from './utils';

const IngressWrapper = styled.div``;

interface IClusterDetailIngressProps
  extends React.ComponentPropsWithoutRef<'div'> {
  clusterID: string;
  provider?: PropertiesOf<typeof Providers>;
  k8sEndpoint?: string;
  kvmTCPHTTPPort?: number;
  kvmTCPHTTPSPort?: number;
}

const ClusterDetailIngress: React.FC<IClusterDetailIngressProps> = ({
  clusterID,
  provider,
  k8sEndpoint,
  kvmTCPHTTPPort,
  kvmTCPHTTPSPort,
  ...rest
}) => {
  const auth = useAuthProvider();

  const appListClient = useHttpClient();
  const appListGetOptions = { namespace: clusterID };
  const { data: appList } = useSWR<
    applicationv1alpha1.IAppList,
    GenericResponse
  >(applicationv1alpha1.getAppListKey(appListGetOptions), () =>
    applicationv1alpha1.getAppList(appListClient, auth, appListGetOptions)
  );

  // TODO(axbarsan): Handle app list error.

  const hasIngress = useMemo(() => {
    const app = findIngressApp(appList?.items);

    return Boolean(app);
  }, [appList?.items]);

  return (
    <IngressWrapper {...rest}>
      <Box margin={{ bottom: 'medium' }}>
        {hasIngress ? (
          <Text>
            These details help you to set up Ingress for exposing services in
            this cluster.
          </Text>
        ) : (
          <Text>
            In order to expose services via Ingress, you must have{' '}
            <code>external-dns</code> and an Ingress controller installed. Giant
            Swarm provides the NGINX Ingress Controller as a managed app.
          </Text>
        )}
      </Box>

      {hasIngress && (
        <Instructions
          provider={provider}
          k8sEndpoint={k8sEndpoint}
          kvmTCPHTTPPort={kvmTCPHTTPPort}
          kvmTCPHTTPSPort={kvmTCPHTTPSPort}
        />
      )}

      {!hasIngress && <InstallIngressButton clusterID={clusterID} />}
    </IngressWrapper>
  );
};

ClusterDetailIngress.propTypes = {
  clusterID: PropTypes.string.isRequired,
  provider: PropTypes.oneOf(Object.values(Providers)),
  k8sEndpoint: PropTypes.string,
  kvmTCPHTTPPort: PropTypes.number,
  kvmTCPHTTPSPort: PropTypes.number,
};

ClusterDetailIngress.defaultProps = {
  provider: Providers.AWS,
  k8sEndpoint: '',
  kvmTCPHTTPPort: 0,
  kvmTCPHTTPSPort: 0,
};

export default ClusterDetailIngress;
