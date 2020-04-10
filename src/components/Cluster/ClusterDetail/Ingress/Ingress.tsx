import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import { Constants, Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

import {
  Description,
  Emphasis,
  Info,
  InfoRow,
  StyledURIBlock,
  Text,
  URIWrapper,
} from './Components';
import Option from './Option';
import Ports from './Ports';

export const Label = styled.span`
  flex: 0 0 220px;
  max-width: 100%;
`;

export const Steps = styled.ol`
  padding-left: 0;
  list-style-position: inside;

  ${URIWrapper} {
    margin-top: 8px;
  }
`;

interface IIngressProps {
  provider?: PropertiesOf<typeof Providers>;
}

const Ingress: React.FC<IIngressProps> = ({ provider, ...rest }) => {
  return (
    <div className='row' {...rest}>
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
        <div className='row'>
          <div className='col-12'>
            <Info>
              <InfoRow>
                <Label>Base domain:</Label>
                <URIWrapper>
                  <StyledURIBlock>
                    .a1b2c.k8s.gollum.westeurope.azure.gigantic.io
                  </StyledURIBlock>
                </URIWrapper>
              </InfoRow>
              <InfoRow>
                <Label>Load balancer DNS name:</Label>
                <URIWrapper>
                  <StyledURIBlock>
                    ingress.a1b2c.k8s.gollum.westeurope.azure.gigantic.io
                  </StyledURIBlock>
                </URIWrapper>
              </InfoRow>
              <InfoRow>
                <Label>Hostname pattern:</Label>
                <URIWrapper>
                  <StyledURIBlock copyContent='YOUR_PREFIX.a1b2c.k8s.gollum.westeurope.azure.gigantic.io'>
                    <Emphasis>YOUR_PREFIX</Emphasis>
                    .a1b2c.k8s.gollum.westeurope.azure.gigantic.io
                  </StyledURIBlock>
                  <Description>
                    Replace <code>YOUR_PREFIX</code> with a unique domain name
                    segment to address your service.
                  </Description>
                </URIWrapper>
              </InfoRow>

              {provider === Providers.KVM && (
                <InfoRow>
                  <Label>Load balancer TCP ports:</Label>
                  <Ports
                    HTTP={Constants.KVM_INGRESS_TCP_HTTP_PORT}
                    HTTPS={Constants.KVM_INGRESS_TCP_HTTPS_PORT}
                  />
                </InfoRow>
              )}
            </Info>
          </div>
        </div>
        <div className='row'>
          <div className='col-12'>
            <Text>
              To expose services in this cluster to the internet, configure your
              ingress resources by choosing one of the following options (A) or
              (B):
            </Text>
          </div>
        </div>
        <div className='row'>
          <div className='col-12'>
            <Option
              id='a'
              footer={
                <>
                  <Text>
                    The benefit here is that if the service moves to a different
                    cluster, the CNAME can be modified to point to the new
                    cluster&apos;s load balancer DNS.
                  </Text>
                  <Text />
                  Caution: DNS change propagation may take up to a day,
                  depending on the TTL configuration of the DNS entry.
                </>
              }
            >
              <Steps>
                <li>
                  Set the <code>hostname</code> in your workload&apos;s ingress
                  resource to a custom DNS name like e. g.{' '}
                  <code>myservice.example.com</code>.
                </li>
                <li>
                  Create a CNAME <code>myservice.example.com</code> pointing to
                  the load balancer DNS name
                  <URIWrapper>
                    <StyledURIBlock>
                      ingress.a1b2c.k8s.gollum.westeurope.azure.gigantic.io
                    </StyledURIBlock>
                  </URIWrapper>
                </li>
              </Steps>
            </Option>
            <Option
              id='b'
              footer={
                <Text>
                  This option does not require dealing with DNS configuration.
                  The downside is that when the service moves to a different
                  cluster, clients consuming the service can no longer use the
                  known URL and will need the new one.
                </Text>
              }
            >
              <Steps>
                <li>
                  Define a DNS prefix unique within the cluster, e. g.{' '}
                  <code>example</code>.
                </li>
                <li>
                  Set the <code>hostname</code> in your workload&apos;s Ingress
                  resource to the according name
                  <URIWrapper>
                    <StyledURIBlock>
                      example.a1b2c.k8s.gollum.westeurope.azure.gigantic.io
                    </StyledURIBlock>
                  </URIWrapper>
                </li>
              </Steps>
            </Option>
          </div>
        </div>
      </div>
    </div>
  );
};

Ingress.propTypes = {
  provider: PropTypes.oneOf(Object.values(Providers)),
};

Ingress.defaultProps = {
  provider: Providers.AWS,
};

export default Ingress;
