'use strict';
import React from 'react';
import Slide from '../component_slider/slide';
import Markdown from './markdown';
import { CodeBlock, Prompt, Output } from './codeblock';
import FileBlock from './fileblock';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import {connect} from 'react-redux';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import { browserHistory } from 'react-router';
import { flashAdd } from '../../actions/flashMessageActions';
import Button from '../button';
import GiantSwarm from '../../lib/giantswarm_client_wrapper';
var Modernizr = window.Modernizr;

var ConfigKubeCtl = React.createClass ({

    getInitialState: function() {
      return {
        loading: true,
        keyPair: {
          generated: false,
          generating: false,
          error: false,
          data: null
        }
      };
    },

    generateKeyPair: function() {
      this.setState({
        keyPair: {
          generating: true,
          error: false
        }
      });

      var authToken = this.props.user.authToken;
      var giantSwarm = new GiantSwarm.Client(authToken);

      giantSwarm.createClusterKeyPair({
        clusterId: this.props.cluster.id,
        description: 'Key pair generated by the Giant Swarm web client'
      })
      .then((response) => {
        this.setState({
          keyPair: {
            generating: false,
            generated: true,
            data: response.result
          }
        });
      })
      .catch((error) => {
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
    },

    componentDidMount: function() {
      if (!this.props.cluster) {
        this.props.dispatch(flashAdd({
          message: <span><b>This organization has no clusters</b><br/>This page might not work as expected.</span>,
          class: 'danger',
          ttl: 3000
        }));

        this.setState({
          loading: 'failed'
        });
      } else if (!this.props.cluster.service_accounts) {
        this.setState({
          loading: true
        });

        this.props.actions.clusterLoadDetails(this.props.cluster.id)
        .then((cluster) => {
          this.setState({
            loading: false
          });
        })
        .catch((error) => {
          this.props.dispatch(flashAdd({
            message: 'Something went wrong while trying to load cluster details. Please try again later or contact support: support@giantswarm.io',
            class: 'danger',
            ttl: 3000
          }));

          this.setState({
            loading: 'failed'
          });
        });
      } else {
        this.setState({
          loading: false
        });
      }
    },

    kubeConfig: function() {
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
    },

    selectCluster: function(clusterId) {
      this.props.actions.clusterSelect(clusterId);
    },

    render() {
      return (
        <Slide>
          <h1>Configure kubectl for your cluster {this.props.cluster ? <code>{this.props.cluster.id}</code> : ''}</h1>
          <p>Generate and download a cluster configuration file for <code>kubectl</code> to work with your Giant Swarm Kubernetes cluster, including a key pair for administrative access.</p>

          {
            this.props.allClusters.length > 1 ?
            <div className='well select-cluster'>
              <div className="select-cluster--dropdown-container">
                <label>Select Cluster:</label>
                <DropdownButton id="cluster-slect-dropdown" title={this.props.cluster.id}>
                  {
                    _.map(this.props.allClusters,
                      clusterId => <MenuItem key={clusterId} onClick={this.selectCluster.bind(this, clusterId)}>{clusterId}</MenuItem>
                    )
                  }
                </DropdownButton>
              </div>

              <p><strong>Watch out:</strong> The key-pair and configuration will be specific for one cluster. As you have access to more than one cluster, please make sure this is the right one.</p>
              <p>You might have access to additional clusters after switching to a different organization.</p>
            </div>
            :
            undefined
          }

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
              {`export KUBECONFIG='\$\{KUBECONFIG\}:/path/to/giantswarm-kubeconfig'`}
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

          <p>Then you can check if you got access to your cluster with:</p>

          <CodeBlock>
            <Prompt>
              {`kubectl cluster-info`}
            </Prompt>
          </CodeBlock>

          <p>Now let&apos;s start something on your cluster.</p>

          <button className='primary' onClick={this.props.goToSlide.bind(null, 'example')}>Continue</button><br/>
          <button onClick={this.props.goToSlide.bind(null, 'download')}>Previous</button>
        </Slide>
      );
    }
});

function mapStateToProps(state, ownProps) {
  var selectedOrganization = state.entities.organizations.items[state.app.selectedOrganization];
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

module.exports = connect(mapStateToProps, mapDispatchToProps)(ConfigKubeCtl);
