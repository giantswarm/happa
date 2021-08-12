import { Box } from 'grommet';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import platform from 'lib/platform';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import { CodeBlock, Output, Prompt } from 'UI/Display/Documentation/CodeBlock';
import GettingStartedBottomNav from 'UI/Display/Documentation/GettingStartedBottomNav';
import { Tab, Tabs } from 'UI/Display/Tabs';
import Aside from 'UI/Layout/Aside';

const StyledTab = styled(Tab)`
  &[aria-expanded='true'] > div {
    background-color: ${({ theme }) =>
      theme.global.colors['background-front'].dark};
  }
`;

class SimpleExample extends React.Component {
  state = {
    loading: true,
    selectedPlatform: platform,
    ingressBaseDomain: window.config.ingressBaseDomain,
  };

  clusterBaseDomain() {
    if (this.props.cluster) {
      return `${this.props.cluster.id}.${this.state.ingressBaseDomain}`;
    }

    return `12345.${this.state.ingressBaseDomain}`;
  }

  selectPlatform(newPlatform) {
    this.setState({
      selectedPlatform: newPlatform,
    });
  }

  isSelectedPlatform(newPlatform) {
    return this.state.selectedPlatform === newPlatform;
  }

  componentDidMount() {
    if (!this.props.cluster) {
      new FlashMessage(
        `This cluster doesn't exist.`,
        messageType.ERROR,
        messageTTL.MEDIUM,
        'This page might not work as expected.'
      );

      this.setState({
        loading: 'failed',
      });
    }
  }

  linkToHelloWorld() {
    if (this.state.loading === 'failed') {
      return 'Could not figure out the url for your hello world app. Sorry.';
    }

    const url = `http://helloworld.${this.clusterBaseDomain()}`;

    return (
      <a href={url} rel='noopener noreferrer' target='_blank'>
        {url}
      </a>
    );
  }

  render() {
    const pathParams = {
      orgId: this.props.match.params.orgId,
      clusterId: this.props.match.params.clusterId,
    };

    const clusterGuideExamplePath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.GettingStarted.SimpleExample,
      pathParams
    );

    const clusterGuideNextStepsPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.GettingStarted.NextSteps,
      pathParams
    );

    return (
      <Breadcrumb
        data={{
          title: 'EXAMPLE',
          pathname: clusterGuideExamplePath,
        }}
      >
        <>
          <h1>Let&apos;s create an example application</h1>
          <p>
            To check if every part of your cluster is running as it should,
            let&apos;s create an entire application. When set up, this
            application will provide a little web server running in multiple
            pods.
          </p>
          <p>
            We use <code>kubectl</code> to create the service, deployment, and
            ingress resource from a manifest hosted on GitHub.
          </p>

          <Aside>
            <i className='fa fa-info' title='For learners' /> If you&apos;re new
            to Kubernetes: A manifest describes things to create in Kubernetes.
            In this case the manifest describes two different things, a service
            and a deployment. The service is there to expose containers (here:
            the ones with the label app: helloworld) inside your cluster via a
            certain hostname and port. The deployment describes your helloworld
            deployment. It manages a replica set, which ensures that a number of
            pods (two, actually) containing Docker containers from a certain
            image are running.
          </Aside>

          <p>First we download the manifest:</p>
          <CodeBlock>
            <Prompt>
              {`
                  wget https://raw.githubusercontent.com/giantswarm/helloworld/master/helloworld-manifest.yaml
                `}
            </Prompt>
          </CodeBlock>

          <p>
            Next replace the placeholder <code>YOUR_CLUSTER_BASE_DOMAIN</code>{' '}
            with <code>{this.clusterBaseDomain()}</code>.
          </p>

          <p>
            If you are on Linux or Mac OS you can use the command below to do
            this. Windows users willl have to use their favorite text editor and
            manually edit the <code>helloworld-manifest.yaml</code> file.
          </p>

          <Box
            background='background-front'
            pad='medium'
            round='xsmall'
            margin={{ vertical: 'medium' }}
          >
            <Tabs>
              <StyledTab title='Linux'>
                <CodeBlock>
                  <Prompt>
                    {`sed -i` +
                      `"" "s/YOUR_CLUSTER_BASE_DOMAIN/${this.clusterBaseDomain()}/" ` +
                      `helloworld-manifest.yaml`}
                  </Prompt>
                </CodeBlock>
              </StyledTab>
              <StyledTab title='Mac OS'>
                <CodeBlock>
                  <Prompt>
                    {`sed -i ` +
                      `"" "s/YOUR_CLUSTER_BASE_DOMAIN/${this.clusterBaseDomain()}/" ` +
                      `helloworld-manifest.yaml`}
                  </Prompt>
                </CodeBlock>
              </StyledTab>
            </Tabs>
          </Box>

          <p>Finally apply the manifest to your cluster:</p>
          <CodeBlock>
            <Prompt>
              {`
                 kubectl apply -f helloworld-manifest.yaml
                `}
            </Prompt>
            <Output>
              {`
service/helloworld created
deployment.apps/helloworld created
poddisruptionbudget.policy/helloworld-pdb created
ingress.networking.k8s.io/helloworld created
                `}
            </Output>
          </CodeBlock>

          <p>
            The deployment will create a replica set, which in turn will create
            pods with the Docker containers running. Once they are up, which
            should take only a few seconds, you can access them using this URL:
          </p>

          <p>{this.linkToHelloWorld()}</p>

          <p>
            This should show a little welcome message from the Giant Swarm team.
          </p>

          <br />

          <h1>Inspecting your service</h1>
          <p>
            Let&apos;s inspect what has actually been generated by Kubernetes
            based on our manifest. This first command lists all deployments,
            filtered to those that have a label <code>app: helloworld</code>:
          </p>

          <CodeBlock>
            <Prompt>kubectl get deployment -l app=helloworld</Prompt>
            <Output>
              {`
NAME         READY   UP-TO-DATE   AVAILABLE   AGE
helloworld   2/2     2            2           2m
                `}
            </Output>
          </CodeBlock>

          <p>
            It should tell us that 2 of our 2 desired pods are currently
            running. Then we list the available services with the according
            label:
          </p>

          <CodeBlock>
            <Prompt>kubectl get svc -l app=helloworld</Prompt>
            <Output>
              {`
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
helloworld   ClusterIP   172.31.144.55   <none>        8080/TCP   2m
                `}
            </Output>
          </CodeBlock>

          <p>And finally we list the pods:</p>

          <CodeBlock>
            <Prompt>kubectl get pods -l app=helloworld</Prompt>
            <Output>
              {`
                  NAME                          READY     STATUS    RESTARTS   AGE
                  helloworld-3495070191-0ynir   1/1       Running   0          3m
                  helloworld-3495070191-onuik   1/1       Running   0          3m
                `}
            </Output>
          </CodeBlock>

          <Aside>
            <i className='fa fa-info' title='For learners' /> The exact pod
            names vary in each case, the first suffix functions a bit like a
            version number for your deployment, this changes with updates to the
            deployment. The last part of the pod name is used by Kubernetes to
            disambiguate the name using a unique suffixes.
          </Aside>

          <p>
            To investigate a bit closer what our containers are doing inside
            their pods, we can look at their logs, one pod at a time. Be sure to
            replace the version and suffix fields (in brackets) with the actual
            ones you got from the
            <code>get pods</code> command above.
          </p>

          <CodeBlock>
            <Prompt>kubectl logs --selector app=helloworld</Prompt>
            <Output>
              {`
2014/07/01 09:57:30 Starting up at :8080
2014/07/01 09:57:40 GET /giant-swarm-logo.svg
2014/07/01 09:57:41 GET /favicon32.ico
2014/07/01 09:57:30 Starting up at :8080
2014/07/01 09:57:40 GET /
2014/07/01 09:57:40 GET /blue-bg.jpg
                `}
            </Output>
          </CodeBlock>

          <p>
            You should see in the log entries that the requests for the HTML
            page, the logo, the favicon, and the background images have been
            distributed over both running pods and their respective containers
            pretty much randomly.
          </p>
          <p>
            To clean things up, we use the <code>kubectl delete</code> command
            on the service, deployment, and ingress we created initially:
          </p>

          <CodeBlock>
            <Prompt>kubectl delete -f helloworld-manifest.yaml</Prompt>
            <Output>
              {`
service "helloworld" deleted
deployment.apps "helloworld" deleted
poddisruptionbudget.policy "helloworld-pdb" deleted
ingress.networking.k8s.io "helloworld" deleted
                `}
            </Output>
          </CodeBlock>

          <GettingStartedBottomNav>
            <Link to={this.props.steps[this.props.stepIndex - 1].url}>
              <Button icon={<i className='fa fa-chevron-left' />}>Back</Button>
            </Link>

            <Link to={clusterGuideNextStepsPath}>
              <Button
                primary={true}
                icon={<i className='fa fa-chevron-right' />}
                reverse={true}
              >
                Finish
              </Button>
            </Link>
          </GettingStartedBottomNav>
        </>
      </Breadcrumb>
    );
  }
}

SimpleExample.propTypes = {
  cluster: PropTypes.object,
  match: PropTypes.object,
  steps: PropTypes.array,
  stepIndex: PropTypes.number,
};

function mapStateToProps(state, ownProps) {
  const selectedCluster =
    state.entities.clusters.items[ownProps.match.params.clusterId];

  return {
    cluster: selectedCluster,
  };
}

export default connect(mapStateToProps)(SimpleExample);
