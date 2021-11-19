import { Box } from 'grommet';
import RoutePath from 'lib/routePath';
import * as clusterActions from 'model/stores/cluster/actions';
import { getLoggedInUser } from 'model/stores/main/selectors';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import { CodeBlock, Prompt } from 'UI/Display/Documentation/CodeBlock';
import GettingStartedBottomNav from 'UI/Display/Documentation/GettingStartedBottomNav';
import { Tab, Tabs } from 'UI/Display/Tabs';
import Aside from 'UI/Layout/Aside';

import ConfigureKubeCtlAlternative from './ConfigureKubectlAlternative';

const StyledTab = styled(Tab)`
  &[aria-expanded='true'] > div {
    background-color: ${({ theme }) =>
      theme.global.colors['background-front'].dark};
  }
`;

const ToggleAlternativeButton = styled.div`
  cursor: pointer;
  margin-bottom: 25px;

  &:last-child {
    margin-bottom: 0px;
  }

  i {
    font-size: 22px;
    position: relative;
    top: 2px;
  }
`;

class ConfigKubeCtl extends React.Component {
  state = {
    alternativeOpen: false,
  };

  selectCluster(clusterId) {
    this.props.actions.clusterSelect(clusterId);
  }

  linuxInstructions = () => {
    return (
      <p>
        Download the latest release{' '}
        <a
          href='https://github.com/giantswarm/gsctl/releases'
          rel='noopener noreferrer'
        >
          from GitHub
        </a>
        , unpack the binary and move it to a location covered by your{' '}
        <code>PATH</code> environment variable.
      </p>
    );
  };

  windowsInstructions = () => {
    return (
      <>
        <p>
          <a href='http://scoop.sh/' rel='noopener noreferrer'>
            scoop
          </a>{' '}
          enables convenient installs and updates for Windows PowerShell users.
          Before you can install gsctl for the first time, execute this:
        </p>
        <CodeBlock>
          <Prompt>
            scoop bucket add giantswarm
            https://github.com/giantswarm/scoop-bucket.git
          </Prompt>
        </CodeBlock>
        <p>To install:</p>
        <CodeBlock>
          <Prompt>scoop install gsctl</Prompt>
        </CodeBlock>
        <p>To update:</p>
        <CodeBlock>
          <Prompt>scoop update gsctl</Prompt>
        </CodeBlock>
        <p>
          To install without scoop, download the latest release{' '}
          <a
            href='https://github.com/giantswarm/gsctl/releases'
            rel='noopener noreferrer'
          >
            from GitHub
          </a>
          , unpack the binary and move it to a location covered by your{' '}
          <code>PATH</code> environment variable.
        </p>
      </>
    );
  };

  macOSinstructions = () => {
    return (
      <>
        <p>
          Homebrew provides the most convenient way to install gsctl and keep it
          up to date. To install, use this command:
        </p>

        <CodeBlock>
          <Prompt>brew tap giantswarm/giantswarm</Prompt>
          <Prompt>brew install gsctl</Prompt>
        </CodeBlock>

        <p>For updating:</p>

        <CodeBlock>
          <Prompt>brew upgrade gsctl</Prompt>
        </CodeBlock>

        <p>
          To install without homebrew, download the latest release{' '}
          <a
            href='https://github.com/giantswarm/gsctl/releases'
            rel='noopener noreferrer'
          >
            from GitHub
          </a>
          , unpack the binary and move it to a location covered by your{' '}
          <code>PATH</code> environment variable.
        </p>
      </>
    );
  };

  toggleAlternative = () => {
    this.setState((prevState) => ({
      alternativeOpen: !prevState.alternativeOpen,
    }));
  };

  friendlyClusterName = (cluster) => {
    return `${cluster.name} (${cluster.id})`;
  };

  render() {
    const pathParams = {
      orgId: this.props.match.params.orgId,
      clusterId: this.props.match.params.clusterId,
    };

    const clusterGuideConfigurationPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.GettingStarted.ConfigureKubeCtl,
      pathParams
    );

    const clusterGuideOverviewPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.GettingStarted.Overview,
      pathParams
    );

    return (
      <Breadcrumb
        data={{
          title: 'CONFIGURE',
          pathname: clusterGuideConfigurationPath,
        }}
      >
        <div className='centered'>
          <h1>
            Configure kubectl for cluster: {this.props.selectedCluster.name}{' '}
            <ClusterIDLabel clusterID={this.props.selectedCluster.id} />
          </h1>

          <p>
            The <code>gsctl</code> command line utility provides access to your
            Giant Swarm resources. It&apos;s perfectly suited to create
            credentials for <code>kubectl</code> in one step. Let&apos;s install{' '}
            <code>gsctl</code> quickly.
          </p>

          <p>
            In case you can&apos;t install <code>gsctl</code> right now, we
            provide an <a href='#alternative'>alternative solution below.</a>
          </p>

          <Box
            background='background-front'
            pad='medium'
            round='xsmall'
            margin={{ vertical: 'medium' }}
          >
            <Tabs>
              <StyledTab title='Linux'>{this.linuxInstructions()}</StyledTab>
              <StyledTab title='Mac OS'>{this.macOSinstructions()}</StyledTab>
              <StyledTab title='Windows'>
                {this.windowsInstructions()}
              </StyledTab>
            </Tabs>
          </Box>

          <p>Run this command to make sure the installation succeeded:</p>

          <CodeBlock>
            <Prompt>{`gsctl --endpoint ${window.config.apiEndpoint} info`}</Prompt>
          </CodeBlock>

          <p>
            Next, we let <code>gsctl</code> do several things in one step:
          </p>

          <ul>
            <li>
              Create a new key pair (certificate and private key) for you to
              access this cluster
            </li>
            <li>Download your key pair</li>
            <li>Download the CA certificate for your cluster</li>
            <li>
              Update your kubectl configuration to add settings and credentials
              for the cluster
            </li>
          </ul>

          <p>Here is the command that you need to execute for all this:</p>

          <CodeBlock>
            <Prompt>
              {`
                gsctl --endpoint ${window.config.apiEndpoint} \\
                  create kubeconfig \\
                  --cluster ${this.props.selectedCluster.id} \\
                  --certificate-organizations system:masters \\
                  --auth-token ${this.props.user.auth.token}`}
            </Prompt>
          </CodeBlock>

          <p>In case you wonder:</p>

          <ul>
            <li>
              <code>--endpoint</code> sets the right API endpoint to use for
              your installation.
            </li>
            <li>
              <code>--cluster &lt;cluster_id&gt;</code> selects the cluster to
              provide access to.
            </li>
            <li>
              <code>--certificate-organizations system:masters</code> ensures
              that you will be authorized as an administrator when using this
              keypair.
            </li>
            <li>
              <code>--auth-token &lt;token&gt;</code> saves you from having to
              enter you password again in <code>gsctl</code>, by re-using the
              token from your current web UI session.
            </li>
          </ul>

          <Aside>
            <i className='fa fa-info' title='For learners' />{' '}
            <code>--certificate-organizations</code> is a flag that sets what
            group you belong to when authenticating against the Kubernetes API.
            The default superadmin group on RBAC (role based access control)
            enabled clusters is <code>system:masters</code>.
          </Aside>

          <div className='well' id='alternative'>
            <ToggleAlternativeButton onClick={this.toggleAlternative}>
              {this.state.alternativeOpen ? (
                <i className='fa fa-chevron-down' />
              ) : (
                <i className='fa fa-chevron-right' />
              )}
              &nbsp; Show alternative method to configure kubectl without gsctl
            </ToggleAlternativeButton>
            {this.state.alternativeOpen ? (
              <ConfigureKubeCtlAlternative
                cluster={this.props.selectedCluster}
                user={this.props.user}
              />
            ) : undefined}
          </div>

          <p>
            After execution, you should see what happened in detail. After
            credentials and settings have been added, the context matching your
            Giant Swarm Kubernetes cluster has been selected for use in{' '}
            <code>kubectl</code>. You can now check things using these commands:
          </p>

          <CodeBlock>
            <Prompt>kubectl cluster-info</Prompt>
          </CodeBlock>

          <p>This should print some information on your cluster.</p>

          <CodeBlock>
            <Prompt>kubectl get nodes</Prompt>
          </CodeBlock>

          <p>Here you should see a list of the worker nodes in your cluster.</p>

          <p>
            Now that this is done, let&apos;s deploy some software on your
            cluster and dig a little deeper.
          </p>

          <GettingStartedBottomNav>
            <Link to={clusterGuideOverviewPath}>
              <Button icon={<i className='fa fa-chevron-left' />}>Back</Button>
            </Link>

            <Link to={this.props.steps[this.props.stepIndex + 1].url}>
              <Button
                primary={true}
                icon={<i className='fa fa-chevron-right' />}
                reverse={true}
              >
                Continue
              </Button>
            </Link>
          </GettingStartedBottomNav>
        </div>
      </Breadcrumb>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const selectedCluster =
    state.entities.clusters.items[ownProps.match.params.clusterId];

  return {
    selectedCluster: selectedCluster,
    clusters: state.entities.clusters,
    user: getLoggedInUser(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigKubeCtl);
