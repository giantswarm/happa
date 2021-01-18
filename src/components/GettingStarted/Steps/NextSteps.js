import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { Link } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';
import Button from 'UI/Button';

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
            href='https://blog.giantswarm.io/getting-started-with-a-local-kubernetes-environment/'
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
            href='https://blog.giantswarm.io/understanding-basic-kubernetes-concepts-i-introduction-to-pods-labels-replicas/'
            rel='noopener noreferrer'
            target='_blank'
          >
            basic concepts of Kubernetes
          </a>
          .
        </p>

        <p>
          Last but not least, you should check out our{' '}
          <a
            href='https://docs.giantswarm.io/'
            rel='noopener noreferrer'
            target='_blank'
          >
            Documentation
          </a>
          , including an{' '}
          <a
            href='https://docs.giantswarm.io/basics/kubernetes-fundamentals/'
            rel='noopener noreferrer'
            target='_blank'
          >
            overview of Kubernetes Fundamentals
          </a>{' '}
          and a selection of{' '}
          <a
            href='https://docs.giantswarm.io/guides/'
            rel='noopener noreferrer'
            target='_blank'
          >
            User Guides
          </a>{' '}
          that help you set up Monitoring, Logging, and more.
        </p>

        <div className='component_slider--nav'>
          <Link to={clusterGuideExamplePath}>
            <Button bsStyle='secondary'>
              <i className='fa fa-chevron-left' /> Back
            </Button>
          </Link>
        </div>
      </>
    </Breadcrumb>
  );
};

NextSteps.propTypes = {
  match: PropTypes.object,
};

export default NextSteps;
