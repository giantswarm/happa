'use strict';
var React                       = require('react');
var Reflux                      = require('reflux');
var Slide                       = require('../component_slider/slide');
var Markdown                    = require('./markdown');
var {CodeBlock, Prompt, Output} = require('./codeblock');
var FileBlock                   = require('./fileblock');
var ClusterStore                = require('../reflux_stores/cluster_store.js');
var ClusterActions              = require('../reflux_actions/cluster_actions.js');

module.exports = React.createClass ({
    mixins: [Reflux.connect(ClusterStore,'clusters'), Reflux.listenerMixin],

    componentDidMount: function() {
      if (this.state.clusters === "NOTLOADED") {
        ClusterActions.fetchAll();
      }
    },

    kubeConfig: function() {
      if (this.state.clusters === "NOTLOADED") {
        return <FileBlock fileName="giantswarm-kubeconfig">
          Loading ...
        </FileBlock>;
      } else if (this.state.clusters === "LOADINGFAILED") {
        return <FileBlock fileName="giantswarm-kubeconfig">
          Could not load your kubeconfig, sorry. Please contact support.
        </FileBlock>;
      } else {
        return (
          <FileBlock fileName="giantswarm-kubeconfig">
            {`
            apiVersion: v1
            kind: Config
            clusters:
             - cluster:
                 certificate-authority-data: ${this.state.clusters[0].certificate_authority_data}
                 server: ${this.state.clusters[0].api_endpoint}
               name: ${this.state.clusters[0].name}
            contexts:
             - context:
                 cluster: ${this.state.clusters[0].name}
                 user: ${this.state.clusters[0].service_accounts[0].name}
               name: giantswarm-default
            users:
             - name: ${this.state.clusters[0].service_accounts[0].name}
               user:
                 client-certificate-data: ${this.state.clusters[0].service_accounts[0].client_certificate_data}
                 client-key-data: ${this.state.clusters[0].service_accounts[0].client_key_data}
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

          <p>To make the configuration from the provided <code>giantswarm-kubeconfig</code> file available to your <code>kubectl</code>, add its path to the <code>KUBECONFIG</code> environment variable by executing this:</p>

          <CodeBlock>
            <Prompt>
              {`export KUBECONFIG="\$\{KUBECONFIG\}:$(pwd)/giantswarm-kubeconfig"`}
            </Prompt>
          </CodeBlock>

          <p>🏆 Real pros add something like the above (including the full path instead of <code>$(pwd)</code>) to a terminal profile, e. g. <code>~/.bash_profile</code> to have it available in all new shell sessions.</p>

          <p>Now, whenever you want to switch to working with your Giant Swarm cluster, use this</p>

          <button className="primary" onClick={this.props.onContinue}>Continue</button><br/>
          <button onClick={this.props.onPrevious}>Previous</button>
        </Slide>
      );
    }
});