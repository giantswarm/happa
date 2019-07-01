import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import { Breadcrumb } from 'react-breadcrumbs';
import { CodeBlock, Output, Prompt } from './codeblock';
import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from '../../lib/flash_message';
import { Link } from 'react-router-dom';
import platform from '../../lib/platform';
import PropTypes from 'prop-types';
import React from 'react';

class SimpleExample extends React.Component {
  state = {
    loading: true,
    selectedPlatform: platform,
    ingressBaseDomain: window.config.ingressBaseDomain,
  };

  clusterBaseDomain() {
    if (this.props.cluster) {
      return `${this.props.cluster.id}.${this.state.ingressBaseDomain}`;
    } else {
      return `12345.${this.state.ingressBaseDomain}`;
    }
  }

  selectPlatform(platform) {
    this.setState({
      selectedPlatform: platform,
    });
  }

  selectedSedCommand() {
    return (
      `sed -i${this.state.selectedPlatform === 'Mac' ? ' ' : ''}` +
      `"" "s/YOUR_CLUSTER_BASE_DOMAIN/${this.clusterBaseDomain()}/" ` +
      `helloworld-manifest.yaml`
    );
  }

  isSelectedPlatform(platform) {
    return this.state.selectedPlatform === platform;
  }

  componentDidMount() {
    if (!this.props.cluster) {
      new FlashMessage(
        'This organization has no clusters.',
        messageType.ERROR,
        messageTTL.MEDIUM,
        'This page might not work as expected.'
      );

      this.setState({
        loading: 'failed',
      });
    } else {
      this.setState({
        loading: true,
      });

      this.props.actions
        .clusterLoadDetails(this.props.cluster.id)
        .then(() => {
          this.setState({
            loading: false,
          });
        })
        .catch(() => {
          new FlashMessage(
            'Something went wrong while trying to load cluster details.',
            messageType.ERROR,
            messageTTL.LONG,
            'Please try again later or contact support: support@giantswarm.io'
          );

          this.setState({
            loading: 'failed',
          });
        });
    }
  }

  linkToHelloWorld() {
    if (this.state.loading === 'failed') {
      return 'Could not figure out the url for your hello world app. Sorry.';
    } else if (this.state.loading) {
      return 'Figuring out the url...';
    } else {
      var url = `http://helloworld.${this.clusterBaseDomain()}`;
      return (
        <a href={url} rel='noopener noreferrer' target='_blank'>
          {url}
        </a>
      );
    }
  }

  render() {
    return (
      <Breadcrumb
        data={{
          title: 'EXAMPLE',
          pathname:
            '/organizations/' +
            this.props.match.params.orgId +
            '/clusters/' +
            this.props.match.params.clusterId +
            '/getting-started/example/',
        }}
      >
        <div className='centered col-9'>
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

          <div className='aside'>
            <p>
              <i className='fa fa-info' title='For learners' /> If you&apos;re
              new to Kubernetes: A manifest describes things to create in
              Kubernetes. In this case the manifest describes two different
              things, a service and a deployment. The service is there to expose
              containers (here: the ones with the label app: helloworld) inside
              your cluster via a certain hostname and port. The deployment
              describes your helloworld deployment. It manages a replica set,
              which ensures that a number of pods (two, actually) containing
              Docker containers from a certain image are running.
            </p>
          </div>

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

          <div className='platform_selector'>
            <ul className='platform_selector--tabs'>
              <li
                className={this.isSelectedPlatform('Linux') ? 'active' : null}
                onClick={this.selectPlatform.bind(this, 'Linux')}
              >
                Linux
              </li>

              <li
                className={this.isSelectedPlatform('Mac') ? 'active' : null}
                onClick={this.selectPlatform.bind(this, 'Mac')}
              >
                Mac OS
              </li>
            </ul>

            <div className='platform_selector--content'>
              <CodeBlock>
                <Prompt>{this.selectedSedCommand()}</Prompt>
              </CodeBlock>
            </div>
          </div>

          <p>Finally apply the manifest to your cluster:</p>
          <CodeBlock>
            <Prompt>
              {`
                 kubectl apply -f helloworld-manifest.yaml
                `}
            </Prompt>
            <Output>
              {`
                  service 'helloworld' created
                  deployment 'helloworld' created
                  ingress "helloworld" created
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
            <Prompt>{`kubectl get deployment -l app=helloworld`}</Prompt>
            <Output>
              {`
                  NAME         DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
                  helloworld   2         2         2            2           2m
                `}
            </Output>
          </CodeBlock>

          <p>
            It should tell us that 2 of our 2 desired pods are currently
            running. Then we list the available services with the according
            label:
          </p>

          <CodeBlock>
            <Prompt>{`kubectl get svc -l app=helloworld`}</Prompt>
            <Output>
              {`
                  NAME         CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
                  helloworld   10.100.70.153   <none>        80/TCP    2m
                `}
            </Output>
          </CodeBlock>

          <p>And finally we list the pods:</p>

          <CodeBlock>
            <Prompt>{`kubectl get pods -l app=helloworld`}</Prompt>
            <Output>
              {`
                  NAME                          READY     STATUS    RESTARTS   AGE
                  helloworld-3495070191-0ynir   1/1       Running   0          3m
                  helloworld-3495070191-onuik   1/1       Running   0          3m
                `}
            </Output>
          </CodeBlock>

          <div className='aside'>
            <p>
              <i className='fa fa-info' title='For learners' /> The exact pod
              names vary in each case, the first suffix functions a bit like a
              version number for your deployment, this changes with updates to
              the deployment. The last part of the pod name is used by
              Kubernetes to disambiguate the name using a unique suffixes.
            </p>
          </div>

          <p>
            To investigate a bit closer what our containers are doing inside
            their pods, we can look at their logs, one pod at a time. Be sure to
            replace the version and suffix fields (in brackets) with the actual
            ones you got from the
            <code>get pods</code> command above.
          </p>

          <CodeBlock>
            <Prompt>{`kubectl logs helloworld-<version>-<suffix>`}</Prompt>
            <Output>
              {`
                  2016/05/20 10:00:00 Starting up at :8080
                  2016/05/20 10:03:19 GET /
                `}
            </Output>
          </CodeBlock>

          <CodeBlock>
            <Prompt>{`kubectl logs <helloworld-<version>-<suffix>`}</Prompt>
            <Output>
              {`
                  2016/05/20 10:00:07 Starting up at :8080
                  2016/05/20 10:03:19 GET /giantswarm_logo_standard_white.svg
                  2016/05/20 10:03:19 GET /blue-bg.jpg
                `}
            </Output>
          </CodeBlock>

          <p>
            You should see in the log entries that the requests for the HTML
            page, the logo, and the background images have been distributed over
            both running pods and their respective containers pretty much
            randomly.
          </p>
          <p>
            To clean things up, we use the <code>kubectl delete</code> command
            on the service, deployment, and ingress we created initially:
          </p>

          <CodeBlock>
            <Prompt>
              {`kubectl delete service,deployment,ingress helloworld`}
            </Prompt>
            <Output>
              {`
                  service "helloworld" deleted
                  deployment "helloworld" deleted
                  ingress "helloworld" deleted
                `}
            </Output>
          </CodeBlock>

          <div className='component_slider--nav'>
            <Link
              to={`/organizations/${this.props.match.params.orgId}/clusters/${this.props.match.params.clusterId}/getting-started/configure/`}
            >
              <button type='button'>
                <i className='fa fa-chevron-left' /> Back
              </button>
            </Link>

            <Link
              to={`/organizations/${this.props.match.params.orgId}/clusters/${this.props.match.params.clusterId}/getting-started/next-steps/`}
            >
              <button className='primary' type='button'>
                Finish <i className='fa fa-chevron-right' />
              </button>
            </Link>
          </div>
        </div>
      </Breadcrumb>
    );
  }
}

SimpleExample.propTypes = {
  actions: PropTypes.object,
  cluster: PropTypes.object,
  dispatch: PropTypes.func,
  goToSlide: PropTypes.func,
  match: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  var selectedCluster =
    state.entities.clusters.items[ownProps.match.params.clusterId];

  return {
    cluster: selectedCluster,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SimpleExample);
