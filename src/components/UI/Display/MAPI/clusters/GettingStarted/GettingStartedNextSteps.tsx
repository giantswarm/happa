import { Box, Heading, Paragraph } from 'grommet';
import * as blog from 'model/constants/blog';
import * as docs from 'model/constants/docs';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useRouteMatch } from 'react-router';

interface IGettingStartedNextStepsProps {}

const GettingStartedNextSteps: React.FC<
  React.PropsWithChildren<IGettingStartedNextStepsProps>
> = () => {
  const match = useRouteMatch<{ orgId: string; clusterId: string }>();

  return (
    <Breadcrumb
      data={{
        title: 'NEXT STEPS',
        pathname: match.url,
      }}
    >
      <Box>
        <Heading level={1}>🎉 Congratulations</Heading>
        <Paragraph fill={true}>
          You have created &ndash; and destroyed &ndash; your first application
          on your brand new Kubernetes cluster on Giant Swarm.
        </Paragraph>
        <Heading level={2} margin={{ top: 'medium' }}>
          Where to go from here?
        </Heading>
        <Paragraph fill={true}>
          Now that you have a running Kubernetes cluster, you can use it to
          deploy anything you like on it.
        </Paragraph>
        <Paragraph fill={true}>
          We recommend to{' '}
          <a
            href={blog.gettingStartedWithAK8sEnvironment}
            rel='noopener noreferrer'
            target='_blank'
          >
            choose a local development environment
          </a>{' '}
          so you can test your apps before deploying to your Giant Swarm
          cluster.
        </Paragraph>
        <Paragraph fill={true}>
          If you have not done so already, you should get acquainted with the{' '}
          <a
            href={blog.understandingBasicK8sConcepts}
            rel='noopener noreferrer'
            target='_blank'
          >
            basic concepts of Kubernetes
          </a>
          .
        </Paragraph>
        <Paragraph fill={true}>
          Last but not least, you should check out our{' '}
          <a href={docs.homeURL} rel='noopener noreferrer' target='_blank'>
            Documentation
          </a>
          , including an{' '}
          <a
            href={docs.kubernetesResourcesURL}
            rel='noopener noreferrer'
            target='_blank'
          >
            overview of Kubernetes resources
          </a>{' '}
          and a selection of{' '}
          <a
            href={docs.gettingStartedURL}
            rel='noopener noreferrer'
            target='_blank'
          >
            guides
          </a>{' '}
          that help you set up basic metrics, RBAC, and more.
        </Paragraph>
      </Box>
    </Breadcrumb>
  );
};

export default GettingStartedNextSteps;
