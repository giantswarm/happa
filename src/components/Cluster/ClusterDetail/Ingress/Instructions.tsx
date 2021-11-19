import Option from 'Cluster/ClusterDetail/Ingress/Option';
import Ports from 'Cluster/ClusterDetail/Ingress/Ports';
import { getBasePathFromK8sEndpoint } from 'Cluster/ClusterDetail/Ingress/util';
import { Providers } from 'model/constants';
import React from 'react';
import styled from 'styled-components';

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
  Example = 'example',
}

interface IInstructionsProps {
  provider?: PropertiesOf<typeof Providers>;
  k8sEndpoint?: string;
  kvmTCPHTTPPort?: number;
  kvmTCPHTTPSPort?: number;
}

const Instructions: React.FC<IInstructionsProps> = ({
  provider,
  k8sEndpoint,
  kvmTCPHTTPPort,
  kvmTCPHTTPSPort,
  ...rest
}) => {
  // Safe because of default props.
  const basePath: string = getBasePathFromK8sEndpoint(k8sEndpoint as string);
  const examplePath: string = `${IngressPathPrefixes.Example}${basePath}`;
  const balancerPath: string = `${IngressPathPrefixes.LoadBalancer}${basePath}`;
  const patternPath: string = `${IngressPathPrefixes.Pattern}${basePath}`;

  return (
    <>
      <Wrapper {...rest}>
        <Info>
          <InfoRow>
            <Label>Base domain:</Label>
            <URIWrapper>
              <StyledURIBlock>{basePath}</StyledURIBlock>
            </URIWrapper>
          </InfoRow>
          <InfoRow>
            <Label>Load balancer DNS name:</Label>
            <URIWrapper>
              <StyledURIBlock>{balancerPath}</StyledURIBlock>
            </URIWrapper>
          </InfoRow>
          <InfoRow>
            <Label>Hostname pattern:</Label>
            <URIWrapper>
              <StyledURIBlock copyContent={patternPath}>
                <Emphasis>{IngressPathPrefixes.Pattern}</Emphasis>
                {basePath}
              </StyledURIBlock>
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
                <StyledURIBlock>{balancerPath}</StyledURIBlock>
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
              <code>example</code>.
            </li>
            <li>
              Set the <code>hostname</code> in your workload&apos;s Ingress
              resource to the according name
              <URIWrapper>
                <StyledURIBlock>{examplePath}</StyledURIBlock>
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
