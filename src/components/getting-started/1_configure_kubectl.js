'use strict';
import React from 'react';
import { CodeBlock, Prompt } from './codeblock';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { connect } from 'react-redux';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import { flashAdd } from '../../actions/flashMessageActions';
import platform from '../../lib/platform';
import ConfigureKubeCtlAlternative from './1_configure_kubectl_alternative';
import ClusterIDLabel from '../shared/cluster_id_label';
import { clustersForOrg } from '../../lib/helpers';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'react-breadcrumbs';

class ConfigKubeCtl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      selectedPlatform: platform,
      alternativeOpen: false,
    };
  }

  componentDidMount() {
    if (this.props.selectedCluster.nullObject) {
      this.props.dispatch(
        flashAdd({
          message: (
            <span>
              <b>This organization has no clusters</b>
              <br />
              We&apos;ve inserted values for a sample cluster.
            </span>
          ),
          class: 'info',
          ttl: 3000,
        })
      );

      this.setState({
        loading: 'failed',
      });
    } else {
      this.setState({
        loading: true,
      });

      this.props.actions
        .clusterLoadDetails(this.props.selectedCluster.id)
        .then(() => {
          this.setState({
            loading: false,
          });
        })
        .catch(() => {
          this.props.dispatch(
            flashAdd({
              message:
                'Something went wrong while trying to load cluster details. Please try again later or contact support: support@giantswarm.io',
              class: 'danger',
              ttl: 3000,
            })
          );

          this.setState({
            loading: 'failed',
          });
        });
    }
  }

  selectCluster(clusterId) {
    this.props.actions.clusterSelect(clusterId);
  }

  selectPlatform(platform) {
    this.setState({
      selectedPlatform: platform,
    });
  }

  selectedInstallInstructions() {
    switch (this.state.selectedPlatform) {
      case 'Windows':
        return (
          <div>
            <p>
              <a href='http://scoop.sh/' rel='noopener noreferrer'>
                scoop
              </a>{' '}
              enables convenient installs and updates for Windows PowerShell
              users. Before you can install gsctl for the first time, execute
              this:
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
          </div>
        );
      case 'Mac':
        return (
          <div>
            <p>
              Homebrew provides the most convenient way to install gsctl and
              keep it up to date. To install, use this command:
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
          </div>
        );
      case 'Linux':
        return (
          <div>
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
          </div>
        );
      default:
        <p>Shouldn&apos;t be here</p>;
    }
  }

  isSelectedPlatform(platform) {
    return this.state.selectedPlatform === platform;
  }

  toggleAlternative = () => {
    this.setState({
      alternativeOpen: !this.state.alternativeOpen,
    });
  };

  friendlyClusterName = cluster => {
    return cluster.name + ' ' + '(' + cluster.id + ')';
  };

  render() {
    return (
      <Breadcrumb
        data={{ title: 'CONFIGURE', pathname: '/getting-started/configure/' }}
      >
        <div className='centered col-9'>
          <h1>
            Configure kubectl for cluster: {this.props.selectedCluster.name}{' '}
            <ClusterIDLabel clusterID={this.props.selectedCluster.id} />
          </h1>

          {this.props.selectedOrgClusters.length > 1 ? (
            <div>
              <p>
                Before we continue, make sure that you have the right cluster
                selected to configure access to:
              </p>
              <div className='well select-cluster'>
                <div className='select-cluster--dropdown-container'>
                  <label>Select Cluster:</label>
                  <DropdownButton
                    id='cluster-slect-dropdown'
                    title={this.friendlyClusterName(this.props.selectedCluster)}
                  >
                    {this.props.selectedOrgClusters.map(cluster => (
                      <MenuItem
                        key={cluster.id}
                        onClick={this.selectCluster.bind(this, cluster.id)}
                      >
                        {this.friendlyClusterName(cluster)}
                      </MenuItem>
                    ))}
                  </DropdownButton>
                </div>

                <p>
                  You might have access to additional clusters after switching
                  to a different organization.
                </p>
              </div>
            </div>
          ) : (
            undefined
          )}

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

              <li
                className={this.isSelectedPlatform('Windows') ? 'active' : null}
                onClick={this.selectPlatform.bind(this, 'Windows')}
              >
                Windows
              </li>
            </ul>

            <div className='platform_selector--content'>
              {this.selectedInstallInstructions()}
            </div>
          </div>

          <p>Run this command to make sure the installation succeeded:</p>

          <CodeBlock>
            <Prompt>
              {`gsctl --endpoint ` + window.config.apiEndpoint + ` info`}
            </Prompt>
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
                gsctl --endpoint ` +
                window.config.apiEndpoint +
                ` \\
                  create kubeconfig \\
                  --cluster ` +
                this.props.selectedCluster.id +
                ` \\
                  --certificate-organizations system:masters \\
                  --auth-token ` +
                this.props.user.auth.token}
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

          <div className='aside'>
            <p>
              <i className='fa fa-info' title='For learners' />{' '}
              <code>--certificate-organizations</code> is a flag that sets what
              group you belong to when authenticating against the Kubernetes
              API. The default superadmin group on RBAC (Role Based Access
              Control) enabled clusters is <code>system:masters</code> . All
              clusters on AWS have RBAC enabled, some of our on-prem (KVM)
              clusters do not.
            </p>
          </div>

          <div className='well' id='alternative'>
            <div
              onClick={this.toggleAlternative}
              className='toggle-alternative'
            >
              {this.state.alternativeOpen ? (
                <i className='fa fa-chevron-down' />
              ) : (
                <i className='fa fa-chevron-right' />
              )}
              &nbsp; Show alternative method to configure kubectl without gsctl
            </div>
            {this.state.alternativeOpen ? (
              <ConfigureKubeCtlAlternative />
            ) : (
              undefined
            )}
          </div>

          <p>
            After execution, you should see what happened in detail. After
            credentials and settings have been added, the context matching your
            Giant Swarm Kubernetes cluster has been selected for use in{' '}
            <code>kubectl</code>. You can now check things using these commands:
          </p>

          <CodeBlock>
            <Prompt>{`kubectl cluster-info`}</Prompt>
          </CodeBlock>

          <p>This should print some information on your cluster.</p>

          <CodeBlock>
            <Prompt>{`kubectl get nodes`}</Prompt>
          </CodeBlock>

          <p>Here you should see a list of the worker nodes in your cluster.</p>

          <p>
            Now that this is done, let&apos;s deploy some software on your
            cluster and dig a little deeper.
          </p>

          <div className='component_slider--nav'>
            <Link to='/getting-started/'>
              <button>
                <i className='fa fa-chevron-left' /> Back
              </button>
            </Link>

            <Link to='/getting-started/example/'>
              <button className='primary'>
                Continue <i className='fa fa-chevron-right' />
              </button>
            </Link>
          </div>
        </div>
      </Breadcrumb>
    );
  }
}

ConfigKubeCtl.propTypes = {
  selectedCluster: PropTypes.object,
  clusters: PropTypes.object,
  dispatch: PropTypes.func,
  actions: PropTypes.object,
  selectedOrgClusters: PropTypes.array,
  user: PropTypes.object,
  goToSlide: PropTypes.func,
};

function mapStateToProps(state) {
  var selectedCluster =
    state.entities.clusters.items[state.app.selectedCluster];
  var selectedOrgClusters = [];

  if (state.app.selectedOrganization) {
    selectedOrgClusters = clustersForOrg(
      state.app.selectedOrganization,
      state.entities.clusters.items
    );
  }

  // If we can't find the selected cluster
  // create a nullObject that acts like a selectedCluster
  // so most of the page will work
  if (selectedCluster === undefined) {
    if (selectedOrgClusters.length === 0) {
      selectedCluster = {
        id: '12345',
        name: 'Sample Cluster',
        nullObject: true,
      };
    } else {
      selectedCluster =
        state.entities.clusters.items[selectedOrgClusters[0].id];
    }
  }

  return {
    selectedCluster: selectedCluster,
    selectedOrgClusters: selectedOrgClusters,
    clusters: state.entities.clusters,
    user: state.app.loggedInUser,
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
)(ConfigKubeCtl);
