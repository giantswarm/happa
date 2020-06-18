import styled from '@emotion/styled';
import Instructions from 'Cluster/ClusterDetail/Ingress/Instructions';
import PropTypes from 'prop-types';
import React from 'react';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

import { Emphasis, Text } from './Components';

const IngressWrapper = styled.div`
  max-width: 1200px;

  & > .col-12 > .row + .row {
    margin-top: ${({ theme }) => theme.spacingPx * 4}px;
  }
`;

interface IIngressProps extends React.ComponentPropsWithoutRef<'div'> {
  provider?: PropertiesOf<typeof Providers>;
  k8sEndpoint?: string;
  kvmTCPHTTPPort?: number;
  kvmTCPHTTPSPort?: number;
  hasOptionalIngress?: boolean;
}

const Ingress: React.FC<IIngressProps> = ({
  provider,
  k8sEndpoint,
  kvmTCPHTTPPort,
  kvmTCPHTTPSPort,
  hasOptionalIngress,
  ...rest
}) => {
  return (
    <IngressWrapper className='row' {...rest}>
      <div className='col-12'>
        <div className='row'>
          <div className='col-12'>
            <Text>
              These details help you to set up Ingress for exposing services in
              this cluster.
            </Text>
            <Text>
              <Emphasis>Note:</Emphasis> In order to expose services via
              Ingress, you must have an Ingress controller installed. Giant
              Swarm provides the NGINX Ingress Controller as a managed app.
            </Text>
          </div>
        </div>
      </div>
      <Instructions
        provider={provider}
        k8sEndpoint={k8sEndpoint}
        kvmTCPHTTPPort={kvmTCPHTTPPort}
        kvmTCPHTTPSPort={kvmTCPHTTPSPort}
      />
    </IngressWrapper>
  );
};

Ingress.propTypes = {
  provider: PropTypes.oneOf(Object.values(Providers)),
  k8sEndpoint: PropTypes.string,
  kvmTCPHTTPPort: PropTypes.number,
  kvmTCPHTTPSPort: PropTypes.number,
  hasOptionalIngress: PropTypes.bool,
};

Ingress.defaultProps = {
  provider: Providers.AWS,
  k8sEndpoint: '',
  kvmTCPHTTPPort: 0,
  kvmTCPHTTPSPort: 0,
  hasOptionalIngress: false,
};

export default Ingress;
