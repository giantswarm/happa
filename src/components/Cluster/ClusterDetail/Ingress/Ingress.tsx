import styled from '@emotion/styled';
import InstallIngressButton from 'Cluster/ClusterDetail/Ingress/InstallIngressButton';
import Instructions from 'Cluster/ClusterDetail/Ingress/Instructions';
import PropTypes from 'prop-types';
import React from 'react';
import { selectIngressAppFromCluster } from 'selectors/clusterSelectors';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

import { Text } from './Components';

const IngressWrapper = styled.div`
  max-width: 1200px;

  & > .col-12 > .row + .row {
    margin-top: ${({ theme }) => theme.spacingPx * 4}px;
  }
`;

interface IIngressProps extends React.ComponentPropsWithoutRef<'div'> {
  cluster: Record<string, never>;
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
    <IngressWrapper className='row' {...rest}>
      <div className='col-12'>
        <div className='row'>
          <div className='col-12'>
            <Text>
              {hasIngress
                ? 'These details help you to set up Ingress for exposing services in this cluster.'
                : 'In order to expose services via Ingress, you must have an Ingress controller installed. Giant Swarm provides the NGINX Ingress Controller as a managed app.'}
            </Text>
          </div>
        </div>
      </div>

      {hasIngress ? (
        <Instructions
          provider={provider}
          k8sEndpoint={k8sEndpoint}
          kvmTCPHTTPPort={kvmTCPHTTPPort}
          kvmTCPHTTPSPort={kvmTCPHTTPSPort}
        />
      ) : (
        <div className='row'>
          <div className='col-12'>
            <InstallIngressButton cluster={cluster} />
          </div>
        </div>
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
