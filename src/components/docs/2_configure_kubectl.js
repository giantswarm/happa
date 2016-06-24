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
          <p>Here we set up a cluster configuration for <code>kubectl</code> to work with your Giant Swarm Kubernetes cluster.</p>
          <p>Everything you need for this step is contained in the <code>giantswarm-kubeconfig</code> below:</p>

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

          <p>Please save that file to your file system with the name <code>giantswarm-kubeconfig</code>.</p>

          <p>Be aware that the file contains your client certificates, so treat this file as sensitive data and make sure it&apos;s only accessible to authorized users.</p>

          <p>Now change into the directory containing the <code>giantswarm-kubeconfig</code> file in a terminal.</p>

          <p>To make the configuration from the provided <code>giantswarm-kubeconfig</code> file available to your <code>kubectl</code>, add its path to the <code>KUBECONFIG</code> environment variable by executing this:</p>

          <CodeBlock>
            <Prompt>
              {`export KUBECONFIG="\$\{KUBECONFIG\}:$(pwd)/giantswarm-kubeconfig"`}
            </Prompt>
          </CodeBlock>

          <p><i className="fa fa-graduation-cap" title="For learners"></i> To save some time in the future, add the command above to a terminal profile, e. g. <code>~/.bash_profile</code> to have it available in all new shell sessions.</p>

          <p>Now, whenever you want to switch to working with your Giant Swarm cluster, use this</p>

          <button className="primary" onClick={this.props.onContinue}>Continue</button><br/>
          <button onClick={this.props.onPrevious}>Previous</button>
        </Slide>
      );
    }
});