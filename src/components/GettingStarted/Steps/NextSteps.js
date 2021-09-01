import { gettingStartedURL, homeURL, kubernetesResourcesURL } from 'lib/docs';
import RoutePath from 'lib/routePath';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { Link } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';
import Button from 'UI/Controls/Button';
import GettingStartedBottomNav from 'UI/Display/Documentation/GettingStartedBottomNav';

const NextSteps = (props) => {
  const pathParams = {
    orgId: props.match.params.orgId,
    clusterId: props.match.params.clusterId,
  };

  const clusterGuideNextStepsPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.GettingStarted.NextSteps,
    pathParams
  );

  const clusterGuideExamplePath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.GettingStarted.SimpleExample,
    pathParams
  );

  return (
    <Breadcrumb
      data={{
        title: 'NEXT-STEPS',
        pathname: clusterGuideNextStepsPath,
      }}
    >
      <>
        <h1>
          <span>🎉</span> Congratulations
        </h1>
        <p>
          You have created &ndash; and destroyed &ndash; your first application
          on your brand new Kubernetes cluster on Giant Swarm.
        </p>
        <br />

        <h3>Where to go from here?</h3>
        <p>
          Now that you have a running Kubernetes cluster, you can use it to
          deploy anything you like on it.
        </p>

        <p>
          We recommend to{' '}
          <a
            href='https://www.giantswarm.io/blog/getting-started-with-a-local-kubernetes-environment'
            rel='noopener noreferrer'
            target='_blank'
          >
            choose a local development environment
          </a>{' '}
          so you can test your apps before deploying to your Giant Swarm
          cluster.
        </p>

        <p>
          If you have not done so already, you should get acquainted with the{' '}
          <a
            href='https://www.giantswarm.io/blog/understanding-basic-kubernetes-concepts-i-introduction-to-pods-labels-replicas'
            rel='noopener noreferrer'
            target='_blank'
          >
            basic concepts of Kubernetes
          </a>
          .
        </p>

        <p>
          Last but not least, you should check out our{' '}
          <a href={homeURL} rel='noopener noreferrer' target='_blank'>
            Documentation
          </a>
          , including an{' '}
          <a
            href={kubernetesResourcesURL}
            rel='noopener noreferrer'
            target='_blank'
          >
            overview of Kubernetes resources
          </a>{' '}
          and a selection of{' '}
          <a href={gettingStartedURL} rel='noopener noreferrer' target='_blank'>
            guides
          </a>{' '}
          that help you set up basic metrics, RBAC, and more.
        </p>

        <GettingStartedBottomNav>
          <Link to={clusterGuideExamplePath}>
            <Button icon={<i className='fa fa-chevron-left' />}>Back</Button>
          </Link>
        </GettingStartedBottomNav>
      </>
    </Breadcrumb>
  );
};

export default NextSteps;
