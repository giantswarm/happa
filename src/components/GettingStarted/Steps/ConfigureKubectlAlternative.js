import { installingCACert } from 'lib/docs';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import platform from 'lib/platform';
import * as clusterActions from 'model/stores/cluster/actions';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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

const CreateKeyPairPlaceHolder = styled.div`
  background-color: ${({ theme }) => theme.colors.darkBlueDarker1};
  padding: 100px 150px;
  padding-top: 150px;
  text-align: center;
  margin: 20px 0px;
  border-radius: 10px;
`;

const KubeconfigAndDownloadButtons = styled.div`
  background-color: ${({ theme }) => theme.colors.darkBlueDarker1};
  padding: 25px;
  margin-bottom: 25px;
  border-radius: 10px;

  .codeblock--container {
    margin: 0px;
  }
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
        description: `Added by user ${this.props.user.email} using the Giant Swarm web interface.`,
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
      .catch((err) => {
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

        ErrorReporter.getInstance().notify(err);
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
        .catch((err) => {
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

          ErrorReporter.getInstance().notify(err);
        });
    }
  }

  kubeConfig() {
    return (
      <KubeconfigAndDownloadButtons>
        <p>
          In the block below is your kubeconfig file. You can download or copy
          it to your clipboard using the buttons in the top right of the block.
        </p>
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
        <hr />
        <p>
          If needed, you can also individually download the certificates and key
          pair embeded in the configuration file above. Installing the CA
          Certificate enables authenticated access to services using a web
          browser.
          <br /> <a href={installingCACert}>Read more in our Docs.</a>
        </p>
        <div className='cert-downloads'>
          <a
            download='ca.crt'
            href={window.URL.createObjectURL(
              new Blob([this.state.keyPair.data.certificate_authority_data], {
                type: 'application/plain;charset=utf-8',
              })
            )}
          >
            <Button>CA CERTIFICATE</Button>
          </a>
          <a
            download='client.crt'
            href={window.URL.createObjectURL(
              new Blob([this.state.keyPair.data.client_certificate_data], {
                type: 'application/plain;charset=utf-8',
              })
            )}
          >
            <Button>CLIENT CERTIFICATE</Button>
          </a>
          <a
            download='client.key'
            href={window.URL.createObjectURL(
              new Blob([this.state.keyPair.data.client_key_data], {
                type: 'application/plain;charset=utf-8',
              })
            )}
          >
            <Button>CLIENT KEY</Button>
          </a>
        </div>
      </KubeconfigAndDownloadButtons>
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
          <CreateKeyPairPlaceHolder>
            <Button
              primary={true}
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
          </CreateKeyPairPlaceHolder>
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
          <Prompt>{`export KUBECONFIG="\$\{KUBECONFIG\}:/path/to/giantswarm-kubeconfig"`}</Prompt>
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

export default connect(undefined, mapDispatchToProps)(ConfigKubeCtl);
