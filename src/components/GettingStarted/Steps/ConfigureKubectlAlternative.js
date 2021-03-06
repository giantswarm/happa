import { exposingWorkloadsURL } from 'lib/docs';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import platform from 'lib/platform';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as clusterActions from 'stores/cluster/actions';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import { CodeBlock, Prompt } from 'UI/Display/Documentation/CodeBlock';
import FileBlock from 'UI/Display/Documentation/FileBlock';
import FlashMessageComponent from 'UI/Display/FlashMessage';
import Aside from 'UI/Layout/Aside';

const KeyPairError = styled.div`
  height: 20px;
  font-size: 14px;
`;

const KeyPairFlashMessage = styled(FlashMessageComponent)`
  display: inline;
  position: relative;
  top: 10px;
`;

class ConfigKubeCtl extends React.Component {
  state = {
    // eslint-disable-next-line react/no-unused-state
    loading: true,
    selectedPlatform: platform,
    alternativeOpen: false,
    keyPair: {
      generated: false,
      generating: false,
      error: false,
      data: null,
    },
  };

  generateKeyPair = () => {
    this.setState({
      keyPair: {
        generating: true,
        error: false,
      },
    });

    this.props.actions
      .clusterCreateKeyPair(this.props.cluster.id, {
        description: `Added by user ${this.props.user.email} using the Happa web interface.`,
        certificate_organizations: 'system:masters',
      })
      .then((keypair) => {
        this.setState({
          keyPair: {
            generating: false,
            generated: true,
            data: keypair,
          },
        });
      })
      .catch(() => {
        const keyPairChangeDelay = 200;

        setTimeout(() => {
          this.setState({
            keyPair: {
              generating: false,
              generated: false,
              error: true,
            },
          });
        }, keyPairChangeDelay);
      });
  };

  componentDidMount() {
    if (!this.props.cluster) {
      new FlashMessage(
        'This organization has no clusters',
        messageType.INFO,
        messageTTL.LONG,
        'Functions on this page might not work as expected'
      );

      this.setState({
        // eslint-disable-next-line react/no-unused-state
        loading: 'failed',
      });
    } else {
      this.setState({
        // eslint-disable-next-line react/no-unused-state
        loading: true,
      });

      this.props.actions
        .clusterLoadDetails(this.props.cluster.id, { withLoadingFlags: false })
        .then(() => {
          this.setState({
            // eslint-disable-next-line react/no-unused-state
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
            // eslint-disable-next-line react/no-unused-state
            loading: 'failed',
          });
        });
    }
  }

  kubeConfig() {
    return (
      <div className='created-key-pair'>
        <FileBlock fileName='giantswarm-kubeconfig'>
          {`
          apiVersion: v1
          kind: Config
          clusters:
          - cluster:
              certificate-authority-data: ${btoa(
                this.state.keyPair.data.certificate_authority_data
              )}
              server: ${this.props.cluster.api_endpoint}
            name: ${this.props.cluster.name}
          contexts:
          - context:
              cluster: ${this.props.cluster.name}
              user: "giantswarm-default"
            name: giantswarm-default
          current-context: giantswarm-default
          users:
          - name: "giantswarm-default"
            user:
              client-certificate-data: ${btoa(
                this.state.keyPair.data.client_certificate_data
              )}
              client-key-data: ${btoa(this.state.keyPair.data.client_key_data)}
          `}
        </FileBlock>
        <div className='well'>
          <h4>Certificate and Key Download</h4>
          <div className='cert-downloads'>
            <a
              download='ca.crt'
              href={window.URL.createObjectURL(
                new Blob([this.state.keyPair.data.certificate_authority_data], {
                  type: 'application/plain;charset=utf-8',
                })
              )}
            >
              <Button bsStyle='default'>CA CERTIFICATE</Button>
            </a>
            <a
              download='client.crt'
              href={window.URL.createObjectURL(
                new Blob([this.state.keyPair.data.client_certificate_data], {
                  type: 'application/plain;charset=utf-8',
                })
              )}
            >
              <Button bsStyle='default'>CLIENT CERTIFICATE</Button>
            </a>
            <a
              download='client.key'
              href={window.URL.createObjectURL(
                new Blob([this.state.keyPair.data.client_key_data], {
                  type: 'application/plain;charset=utf-8',
                })
              )}
            >
              <Button bsStyle='default'>CLIENT KEY</Button>
            </a>
          </div>
          <p>
            These files resemble the certificates in the configuration file
            above. They facilitate authenticated access to services using a web
            browser. <a href={exposingWorkloadsURL}>Read more in our Docs.</a>
          </p>
        </div>
      </div>
    );
  }

  isSelectedPlatform(nextPlatform) {
    return this.state.selectedPlatform === nextPlatform;
  }

  toggleAlternative() {
    this.setState((prevState) => ({
      alternativeOpen: !prevState.alternativeOpen,
    }));
  }

  selectCluster(clusterId) {
    this.props.actions.clusterSelect(clusterId);
  }

  render() {
    return (
      <>
        <p>
          Generate and download a cluster configuration file for{' '}
          <code>kubectl</code> to work with your Giant Swarm Kubernetes cluster,
          including a key pair for administrative access.
        </p>

        {this.state.keyPair.generated ? (
          this.kubeConfig()
        ) : (
          <div className='create-key-pair'>
            <Button
              bsStyle='primary'
              loading={this.state.keyPair.generating}
              onClick={this.generateKeyPair}
            >
              Create cluster configuration
            </Button>
            <p>
              <strong>
                This will create a configuration file containing a new key pair
              </strong>
            </p>
            <KeyPairError>
              {this.state.keyPair.error ? (
                <KeyPairFlashMessage type='danger'>
                  Request failed. Please try again later or contact support
                </KeyPairFlashMessage>
              ) : null}
            </KeyPairError>
          </div>
        )}

        <p>
          Once generated, please save that file to your file system with the
          name <code>giantswarm-kubeconfig</code>.
        </p>

        <p>
          Be aware that the file contains your client certificates, so treat
          this file as sensitive data and make sure it&apos;s only accessible to
          authorized users.
        </p>

        <p>
          Now change into the directory containing the{' '}
          <code>giantswarm-kubeconfig</code> file in a terminal.
        </p>

        <p>
          To make the configuration from the provided{' '}
          <code>giantswarm-kubeconfig</code> file available to your{' '}
          <code>kubectl</code>, add its path to the <code>KUBECONFIG</code>{' '}
          environment variable by executing this (replacing{' '}
          <code>/path/to</code> with your actual path):
        </p>

        <CodeBlock>
          <Prompt>
            {`export KUBECONFIG="\$\{KUBECONFIG\}:/path/to/giantswarm-kubeconfig"`}
          </Prompt>
        </CodeBlock>

        <Aside>
          <i className='fa fa-info' title='For learners' /> To save some time in
          the future, add the command above to a terminal profile, e. g.{' '}
          <code>~/.bash_profile</code> to have it available in all new shell
          sessions.
        </Aside>

        <p>
          The above config file also sets the current context to
          `giantswarm-default`. You can check this with
        </p>

        <CodeBlock>
          <Prompt>kubectl config view</Prompt>
        </CodeBlock>

        <p>
          If another context is selected and whenever you want to switch back to
          working with your Giant Swarm cluster, use this command:
        </p>

        <CodeBlock>
          <Prompt>kubectl config use-context giantswarm-default</Prompt>
        </CodeBlock>

        <div className='aside'>
          <p>
            <i className='fa fa-info' title='For learners' /> Again, here you
            can save your future self some time by creating an alias.
          </p>
        </div>
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
  };
}

ConfigKubeCtl.propTypes = {
  user: PropTypes.object,
  cluster: PropTypes.object,
  actions: PropTypes.object,
};

export default connect(undefined, mapDispatchToProps)(ConfigKubeCtl);
