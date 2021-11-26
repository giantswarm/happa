import { Box, Heading, Paragraph } from 'grommet';
import InstallIngressButton from 'MAPI/apps/InstallIngressButton';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useRouteMatch } from 'react-router';

interface IGettingStartedInstallIngressProps {}

const GettingStartedInstallIngress: React.FC<
  IGettingStartedInstallIngressProps
> = () => {
  const match = useRouteMatch<{ orgId: string; clusterId: string }>();
  const { clusterId } = match.params;

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
        <InstallIngressButton clusterID={clusterId} />
      </Box>
    </Breadcrumb>
  );
};

export default GettingStartedInstallIngress;
