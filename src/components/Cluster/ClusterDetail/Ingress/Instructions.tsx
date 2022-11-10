import Option from 'Cluster/ClusterDetail/Ingress/Option';
import Ports from 'Cluster/ClusterDetail/Ingress/Ports';
import { getBasePathFromK8sEndpoint } from 'Cluster/ClusterDetail/Ingress/util';
import { Providers } from 'model/constants';
import React from 'react';
import styled from 'styled-components';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

import {
  Description,
  Emphasis,
  Info,
  InfoRow,
  StyledURIBlock,
  Text,
  URIWrapper,
} from './Components';

const Wrapper = styled.div`
  margin-bottom: 75px;
`;

const Label = styled.span`
  flex: 0 0 220px;
  max-width: 100%;
`;

const Steps = styled.ol`
  padding-left: 0;
  list-style-position: inside;

  ${URIWrapper} {
    margin-top: 8px;
  }
`;

enum IngressPathPrefixes {
  Pattern = 'YOUR_PREFIX',
  LoadBalancer = 'ingress',
  Example = 'EXAMPLE',
}

interface IInstructionsProps {
  provider?: PropertiesOf<typeof Providers>;
  k8sEndpoint?: string;
  kvmTCPHTTPPort?: number;
  kvmTCPHTTPSPort?: number;
}

const Instructions: React.FC<React.PropsWithChildren<IInstructionsProps>> = ({
  provider,
  k8sEndpoint,
  kvmTCPHTTPPort,
  kvmTCPHTTPSPort,
  ...rest
}) => {
  // Safe because of default props.
  const basePath: string | undefined =
    getBasePathFromK8sEndpoint(k8sEndpoint as string) || undefined;

  return (
    <>
      <Wrapper {...rest}>
        <Info>
          <InfoRow>
            <Label id='base-domain-label'>Base domain:</Label>
            <URIWrapper>
              <OptionalValue
                value={basePath}
                loaderWidth={200}
                loaderHeight={20}
              >
                {() => (
                  <StyledURIBlock aria-labelledby='base-domain-label'>
                    {basePath}
                  </StyledURIBlock>
                )}
              </OptionalValue>
            </URIWrapper>
          </InfoRow>
          <InfoRow>
            <Label id='load-balancer-label'>Load balancer DNS name:</Label>
            <URIWrapper>
              <OptionalValue
                value={basePath}
                loaderWidth={200}
                loaderHeight={20}
              >
                {() => (
                  <StyledURIBlock aria-labelledby='load-balancer-label'>
                    {`${IngressPathPrefixes.LoadBalancer}${basePath}`}
                  </StyledURIBlock>
                )}
              </OptionalValue>
            </URIWrapper>
          </InfoRow>
          <InfoRow>
            <Label id='hostname-label'>Hostname pattern:</Label>
            <URIWrapper>
              <OptionalValue
                value={basePath}
                loaderWidth={200}
                loaderHeight={20}
              >
                {() => (
                  <StyledURIBlock
                    copyContent={`${IngressPathPrefixes.Pattern}${basePath}`}
                    aria-labelledby='hostname-label'
                  >
                    <Emphasis>{IngressPathPrefixes.Pattern}</Emphasis>
                    {basePath}
                  </StyledURIBlock>
                )}
              </OptionalValue>
              <Description>
                Replace <code>{IngressPathPrefixes.Pattern}</code> with a unique
                domain name segment to address your service.
              </Description>
            </URIWrapper>
          </InfoRow>

          {provider === Providers.KVM && (
            <InfoRow>
              <Label>Load balancer TCP ports:</Label>
              <Ports HTTP={kvmTCPHTTPPort} HTTPS={kvmTCPHTTPSPort} />
            </InfoRow>
          )}
        </Info>
      </Wrapper>

      <Text>
        To expose services in this cluster to the internet, configure your
        ingress resources by choosing one of the following options (A) or (B):
      </Text>

      <>
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
              Caution: DNS change propagation may take up to a day, depending on
              the TTL configuration of the DNS entry.
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
              Create a CNAME <code>myservice.example.com</code> pointing to the
              load balancer DNS name
              <URIWrapper>
                <OptionalValue
                  value={basePath}
                  loaderWidth={200}
                  loaderHeight={20}
                >
                  {() => (
                    <StyledURIBlock>{`${IngressPathPrefixes.LoadBalancer}${basePath}`}</StyledURIBlock>
                  )}
                </OptionalValue>
              </URIWrapper>
            </li>
          </Steps>
        </Option>
        <Option
          id='b'
          footer={
            <Text>
              This option does not require dealing with DNS configuration. The
              downside is that when the service moves to a different cluster,
              clients consuming the service can no longer use the known URL and
              will need the new one.
            </Text>
          }
        >
          <Steps>
            <li>
              Define a DNS prefix unique within the cluster, e. g.{' '}
              <code>EXAMPLE</code>.
            </li>
            <li>
              Set the <code>hostname</code> in your workload&apos;s Ingress
              resource to the according name
              <URIWrapper>
                <OptionalValue
                  value={basePath}
                  loaderWidth={200}
                  loaderHeight={20}
                >
                  {() => (
                    <StyledURIBlock>{`${IngressPathPrefixes.Example}${basePath}`}</StyledURIBlock>
                  )}
                </OptionalValue>
              </URIWrapper>
            </li>
          </Steps>
        </Option>
      </>
    </>
  );
};

Instructions.defaultProps = {
  provider: Providers.AWS,
  k8sEndpoint: '',
  kvmTCPHTTPPort: 0,
  kvmTCPHTTPSPort: 0,
};

export default Instructions;
