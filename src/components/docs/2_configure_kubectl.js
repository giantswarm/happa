'use strict';
import React from 'react';
import Slide from '../component_slider/slide';
import Markdown from './markdown';
import { CodeBlock, Prompt, Output } from './codeblock';
import FileBlock from './fileblock';
import {connect} from 'react-redux';
import {loadClusters} from '../../actions/clusterActions';

var ConfigKubeCtl = React.createClass ({

    componentWillMount: function() {
      // TODO: Fire off a load cluster details action here
      if (!this.props.cluster.service_accounts) {
        this.setState({
          loading: true
        });
      } else {
        this.setState({
          loading: false
        });
      }
    },

    kubeConfig: function() {
      if (this.state.loading) {
        return <FileBlock fileName='giantswarm-kubeconfig'>
          Loading ...
        </FileBlock>;
      } else if (this.tate.loading === 'failed') {
        return <FileBlock fileName='giantswarm-kubeconfig'>
          Could not load your kubeconfig, sorry. Please contact support.
        </FileBlock>;
      } else {
        return (
          <FileBlock fileName='giantswarm-kubeconfig'>
            {`
            apiVersion: v1
            kind: Config
            clusters:
             - cluster:
                 certificate-authority-data: ${this.props.cluster.certificate_authority_data}
                 server: ${this.props.cluster.api_endpoint}
               name: ${this.props.cluster.name}
            contexts:
             - context:
                 cluster: ${this.props.cluster.name}
                 user: ${this.props.cluster.service_accounts[0].name}
               name: giantswarm-default
            users:
             - name: ${this.props.cluster.service_accounts[0].name}
               user:
                 client-certificate-data: ${this.props.cluster.service_accounts[0].client_certificate_data}
                 client-key-data: ${this.props.cluster.service_accounts[0].client_key_data}
            `}
          </FileBlock>
        );
      }
    },

    render() {
      return (
        <Slide>
          <h1>Configure kubectl for your cluster</h1>
          <p>Here we set up a cluster configuration for <code>kubectl</code> to work with your Giant Swarm Kubernetes cluster.</p>
          <p>Everything you need for this step is contained in the <code>giantswarm-kubeconfig</code> below:</p>

          { this.kubeConfig() }

          <p>Please save that file to your file system with the name <code>giantswarm-kubeconfig</code>.</p>

          <p>Be aware that the file contains your client certificates, so treat this file as sensitive data and make sure it&apos;s only accessible to authorized users.</p>

          <p>Now change into the directory containing the <code>giantswarm-kubeconfig</code> file in a terminal.</p>

          <p>To make the configuration from the provided <code>giantswarm-kubeconfig</code> file available to your <code>kubectl</code>, add its path to the <code>KUBECONFIG</code> environment variable by executing this (replacing <code>/path/to</code> with your actual path):</p>

          <CodeBlock>
            <Prompt>
              {`export KUBECONFIG='\$\{KUBECONFIG\}:/path/to/giantswarm-kubeconfig'`}
            </Prompt>
          </CodeBlock>

          <p><i className='fa fa-graduation-cap' title='For learners'></i> To save some time in the future, add the command above to a terminal profile, e. g. <code>~/.bash_profile</code> to have it available in all new shell sessions.</p>

          <p>Now, whenever you want to switch to working with your Giant Swarm cluster, use this command:</p>

          <CodeBlock>
            <Prompt>
              {`kubectl config use-context giantswarm-default`}
            </Prompt>
          </CodeBlock>

          <p><i className='fa fa-graduation-cap' title='For learners'></i> Again, here you can save your future self some time by creating an alias.</p>

          <p>Now let&apos;s start something on your cluster.</p>

          <button className='primary' onClick={this.props.goToSlide.bind(null, 'example')}>Continue</button><br/>
          <button onClick={this.props.goToSlide.bind(null, 'download')}>Previous</button>
        </Slide>
      );
    }
});

function mapStateToProps(state, ownProps) {
  var selectedOrganization = state.entities.organizations.items[state.app.selectedOrganization];
  var firstClusterId = selectedOrganization.clusters[0];
  var firstCluster = state.entities.clusters.items[firstClusterId];

  return {
    cluster: firstCluster
  };
}

module.exports = connect(mapStateToProps)(ConfigKubeCtl);