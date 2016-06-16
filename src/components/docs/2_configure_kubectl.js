'use strict';
var React = require('react');
var Slide = require('../component_slider/slide');
var Markdown = require('./markdown');
var {CodeBlock, Prompt, Output} = require('./codeblock');
var FileBlock = require('./fileblock');

module.exports = React.createClass ({
    render() {
      return (
        <Slide>
          <h1>Configure kubectl for your cluster</h1>
          <p>Here we set up a cluster configuration for kubectl to work with your Giant Swarm Kubernetes cluster.</p>
          <p>Everything you need for this step is contained in the giantswarm-kubeconfig below:</p>

          <FileBlock fileName="giantswarm-kubeconfig">
          {`
          apiVersion: v1
          kind: Config
          clusters:
           - cluster:
               certificate-authority-data: <CA_DATA>
               server: https://go9cdgqfnr.giantswarm-kaas.io
             name: go9cdgqfnr
          contexts:
           - context:
               cluster: go9cdgqfnr
               user: giantswarm-default-admin
             name: giantswarm-default
          users:
           - name: giantswarm-default-admin
             user:
               client-certificate-data: <CLIENT_CERTIFICATE_DATA>
               client-key-data: <CLIENT_KEY_DATA>
          `}
          </FileBlock>

          <p>Please save that file to your file system.</p>

          <p>Be aware that the file contains your client certificates, so treat this file as sensitive data and make sure it's only accessible to authorized users.</p>

          <p>Now change into the directory containing the giantswarm-kubeconfig file in a terminal.</p>

          <p>To make the configuration from the provided giantswarm-kubeconfig file available to your kubectl, add its path to the KUBECONFIG environment variable by executing this:</p>

          <CodeBlock>
            <Prompt>
              {`export KUBECONFIG="\$\{KUBECONFIG\}:$(pwd)/giantswarm-kubeconfig"`}
            </Prompt>
          </CodeBlock>

          <p>🏆 Real pros add something like that (including the full path instead of $(pwd)) to a terminal profile, e. g. ~/.bash_profile to have this available in all new shell sessions.</p>

          <p>Now, whenever you want to switch to working with your Giant Swarm cluster, use this</p>

          <button className="primary" onClick={this.props.onContinue}>Continue</button><br/>
          <button onClick={this.props.onPrevious}>Previous</button>
        </Slide>
      );
    }
});