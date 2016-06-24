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
          <h1>Let&apos;s create an example application</h1>
          <p>To check if every part of your cluster is running as it should, let&apos;s create an entire application. When set up, this application will provide a little web server running in multiple pods.</p>
          <p>Here is the manifest we need:</p>

          <FileBlock fileName="helloworld-manifest.yaml">
          {`
          apiVersion: v1
          kind: Service
          metadata:
            name: helloworld
            labels:
              app: helloworld
          spec:
            ports:
            - port: 80
              targetPort: 8080
            selector:
              app: helloworld
          ---
          apiVersion: extensions/v1beta1
          kind: Deployment
          metadata:
            name: helloworld
            labels:
              app: helloworld
          spec:
            replicas: 2
            selector:
              matchLabels:
                app: helloworld
            template:
              metadata:
                labels:
                  app: helloworld
              spec:
                containers:
                - name: helloworld
                  image: giantswarm/helloworld:latest
                  ports:
                  - containerPort: 8080
          `}
          </FileBlock>

          <p>Save the above manifest in a file called <code>helloworld-manifest.yaml</code>.</p>
          <p><i class="fa fa-graduation-cap" title="For learners"></i> If you&apos;re new to Kubernetes: A manifest describes things to create in Kubernetes. In this case the manifest describes two different things, a service and a deployment. The service is there to expose containers (here: the ones with the label app: helloworld) inside your cluster via a certain hostname and port. The deployment describes your helloworld deployment. It manages a replica set, which ensures that a number of pods (two, actually) containing Docker containers from a certain image are running.</p>
          <p>Now use <code>kubectl</code> to create the service and the deployment:</p>

          <CodeBlock>
            <Prompt>
              {`kubectl create -f helloworld-manifest.yaml`}
            </Prompt>
            <Output>
              {`
                service "helloworld" created
                deployment "helloworld" created
              `}
            </Output>
          </CodeBlock>

          <p>The deployment will create a replica set, which in turn will create pods with the Docker containers running. Once they are up, which should take only a few seconds, you can access them using this URL:</p>

          <a href="http://go9cdgqfnr.giantswarm-kaas.io/api/v1/proxy/namespaces/default/services/helloworld/" target="_blank">http://go9cdgqfnr.giantswarm-kaas.io/api/v1/proxy/namespaces/default/services/helloworld/</a>

          <p>This should show a little welcome message from the Giant Swarm team.</p>

          <button className="primary" onClick={this.props.onContinue}>Continue</button><br/>
          <button onClick={this.props.onPrevious}>Previous</button>
        </Slide>
      );
    }
});