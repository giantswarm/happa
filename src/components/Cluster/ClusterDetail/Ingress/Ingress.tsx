import InstallIngressButton from 'Cluster/ClusterDetail/Ingress/InstallIngressButton';
import Instructions from 'Cluster/ClusterDetail/Ingress/Instructions';
import PropTypes from 'prop-types';
import React from 'react';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { selectIngressAppFromCluster } from 'stores/appcatalog/selectors';
import styled from 'styled-components';

import { Text } from './Components';

const IngressWrapper = styled.div``;

interface IIngressProps extends React.ComponentPropsWithoutRef<'div'> {
  cluster: Cluster;
  provider?: PropertiesOf<typeof Providers>;
  k8sEndpoint?: string;
  kvmTCPHTTPPort?: number;
  kvmTCPHTTPSPort?: number;
}

const Ingress: React.FC<IIngressProps> = ({
  cluster,
  provider,
  k8sEndpoint,
  kvmTCPHTTPPort,
  kvmTCPHTTPSPort,
  ...rest
}) => {
  const ingressApp = selectIngressAppFromCluster(cluster);
  const hasIngress = typeof ingressApp !== 'undefined';

  return (
    <IngressWrapper {...rest}>
      <Text>
        {hasIngress
          ? 'These details help you to set up Ingress for exposing services in this cluster.'
          : 'In order to expose services via Ingress, you must have external-dns and an Ingress controller installed. Giant Swarm provides the NGINX Ingress Controller as a managed app.'}
      </Text>

      {hasIngress ? (
        <Instructions
          provider={provider}
          k8sEndpoint={k8sEndpoint}
          kvmTCPHTTPPort={kvmTCPHTTPPort}
          kvmTCPHTTPSPort={kvmTCPHTTPSPort}
        />
      ) : (
        <InstallIngressButton cluster={cluster} />
      )}
    </IngressWrapper>
  );
};

Ingress.propTypes = {
  // @ts-ignore
  cluster: PropTypes.object.isRequired,
  provider: PropTypes.oneOf(Object.values(Providers)),
  k8sEndpoint: PropTypes.string,
  kvmTCPHTTPPort: PropTypes.number,
  kvmTCPHTTPSPort: PropTypes.number,
};

Ingress.defaultProps = {
  provider: Providers.AWS,
  k8sEndpoint: '',
  kvmTCPHTTPPort: 0,
  kvmTCPHTTPSPort: 0,
};

export default Ingress;
