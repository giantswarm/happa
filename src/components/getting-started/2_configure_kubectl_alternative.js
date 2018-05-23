'use strict';
import React from 'react';
import { CodeBlock, Prompt } from './codeblock';
import FileBlock from './fileblock';
import {connect} from 'react-redux';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import { flashAdd } from '../../actions/flashMessageActions';
import Button from '../button';
import platform from '../../lib/platform';
import PropTypes from 'prop-types';

var Modernizr = window.Modernizr;

class ConfigKubeCtl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selectedPlatform: platform,
      alternativeOpen: false,
      keyPair: {
        generated: false,
        generating: false,
        error: false,
        data: null
      }
    };
  }

  generateKeyPair = () => {
    this.setState({
      keyPair: {
        generating: true,
        error: false
      }
    });

    this.props.actions.clusterCreateKeyPair(this.props.cluster.id, {
      description: `Added by user ${this.props.user.email} using the Happa web interface.`,
      certificate_organizations: 'system:masters',
    })
    .then((keypair) => {
      this.setState({
        keyPair: {
          generating: false,
          generated: true,
          data: keypair
        }
      });
    })
    .catch((error) => {
      console.log(error);

      setTimeout(() => {
        this.setState({
          keyPair: {
            generating: false,
            generated: false,
            error: true
          }
        });
      }, 200);
    });
  }

  componentDidMount() {
    if (!this.props.cluster) {
      this.props.dispatch(flashAdd({
        message: <span><b>This organization has no clusters</b><br/>This page might not work as expected.</span>,
        class: 'danger',
        ttl: 3000
      }));

      this.setState({
        loading: 'failed'
      });
    } else {
      this.setState({
        loading: true
      });

      this.props.actions.clusterLoadDetails(this.props.cluster.id)
      .then(() => {
        this.setState({
          loading: false
        });
      })
      .catch(() => {
        this.props.dispatch(flashAdd({
          message: 'Something went wrong while trying to load cluster details. Please try again later or contact support: support@giantswarm.io',
          class: 'danger',
          ttl: 3000
        }));

        this.setState({
          loading: 'failed'
        });
      });
    }
  }

  kubeConfig() {
    return (
      <div className="created-key-pair">
        <FileBlock fileName='giantswarm-kubeconfig'>
          {`
          apiVersion: v1
          kind: Config
          clusters:
          - cluster:
              certificate-authority-data: ${btoa(this.state.keyPair.data.certificate_authority_data)}
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
              client-certificate-data: ${btoa(this.state.keyPair.data.client_certificate_data)}
              client-key-data: ${btoa(this.state.keyPair.data.client_key_data)}
          `}
        </FileBlock>
        <div className='well'>
          <h4>Certificate and Key Download</h4>
          {
            Modernizr.adownload ?
            <div className="cert-downloads">
              <a className="button outline" href={window.URL.createObjectURL(new Blob([this.state.keyPair.data.certificate_authority_data], {type: 'application/plain;charset=utf-8'}))} download='ca.crt'>CA CERTIFICATE</a>
              <a className="button outline" href={window.URL.createObjectURL(new Blob([this.state.keyPair.data.client_certificate_data], {type: 'application/plain;charset=utf-8'}))} download='client.crt'>CLIENT CERTIFICATE</a>
              <a className="button outline" href={window.URL.createObjectURL(new Blob([this.state.keyPair.data.client_key_data], {type: 'application/plain;charset=utf-8'}))} download='client.key'>CLIENT KEY</a>
            </div>
            :
            <div className="cert-downloads">
              <FileBlock fileName='ca.crt' hideText={true}>
                {this.state.keyPair.data.certificate_authority_data}
              </FileBlock>

              <FileBlock fileName='client.crt' hideText={true}>
                {this.state.keyPair.data.client_certificate_data}
              </FileBlock>

              <FileBlock fileName='client.key' hideText={true}>
                {this.state.keyPair.data.client_key_data}
              </FileBlock>
            </div>
          }

          <p>These files resemble the certificates in the configuration file above. They facilitate authenticated access to services using a web browser. <a href="https://docs.giantswarm.io/guides/accessing-services-from-the-outside/">Read more in our Docs.</a></p>
        </div>
      </div>
    );
  }


  isSelectedPlatform(platform) {
    return (this.state.selectedPlatform === platform);
  }

  toggleAlternative() {
    this.setState({
      alternativeOpen: ! this.state.alternativeOpen
    });
  }

  selectCluster(clusterId) {
    this.props.actions.clusterSelect(clusterId);
  }

  render() {
    return (
      <div>
        <p>Generate and download a cluster configuration file for <code>kubectl</code> to work with your Giant Swarm Kubernetes cluster, including a key pair for administrative access.</p>

        {
          this.state.keyPair.generated
          ?
            this.kubeConfig()
          :
            <div className='create-key-pair'>
              <Button bsStyle="primary" loading={this.state.keyPair.generating} onClick={this.generateKeyPair}>Create cluster configuration</Button>
              <p><strong>This will create a configuration file containing a new key pair</strong></p>
              <div className='key-pair-error'>
              {
                this.state.keyPair.error
                ?
                  <div className="flash-messages--flash-message flash-messages--danger">
                    Request failed. Please try again later or contact support
                  </div>
                :
                  null
              }
              </div>
            </div>
        }

        <p>Once generated, please save that file to your file system with the name <code>giantswarm-kubeconfig</code>.</p>

        <p>Be aware that the file contains your client certificates, so treat this file as sensitive data and make sure it&apos;s only accessible to authorized users.</p>

        <p>Now change into the directory containing the <code>giantswarm-kubeconfig</code> file in a terminal.</p>

        <p>To make the configuration from the provided <code>giantswarm-kubeconfig</code> file available to your <code>kubectl</code>, add its path to the <code>KUBECONFIG</code> environment variable by executing this (replacing <code>/path/to</code> with your actual path):</p>

        <CodeBlock>
          <Prompt>
            {`export KUBECONFIG="\$\{KUBECONFIG\}:/path/to/giantswarm-kubeconfig"`}
          </Prompt>
        </CodeBlock>

        <div className="aside">
        <p><i className='fa fa-graduation-cap' title='For learners'></i> To save some time in the future, add the command above to a terminal profile, e. g. <code>~/.bash_profile</code> to have it available in all new shell sessions.</p>
        </div>

        <p>The above config file also sets the current context to `giantswarm-default`. You can check this with</p>

        <CodeBlock>
          <Prompt>
            {`kubectl config view`}
          </Prompt>
        </CodeBlock>

        <p>If another context is selected and whenever you want to switch back to working with your Giant Swarm cluster, use this command:</p>

        <CodeBlock>
          <Prompt>
            {`kubectl config use-context giantswarm-default`}
          </Prompt>
        </CodeBlock>

        <div className="aside">
        <p><i className='fa fa-graduation-cap' title='For learners'></i> Again, here you can save your future self some time by creating an alias.</p>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  var selectedCluster = state.entities.clusters.items[state.app.selectedCluster];

  return {
    cluster: selectedCluster,
    allClusters: state.entities.organizations.items[state.app.selectedOrganization].clusters,
    user: state.app.loggedInUser
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

ConfigKubeCtl.propTypes = {
  user: PropTypes.object,
  cluster: PropTypes.object,
  dispatch: PropTypes.func,
  actions: PropTypes.object
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigKubeCtl);
