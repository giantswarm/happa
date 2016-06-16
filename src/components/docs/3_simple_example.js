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
          <h1>Let’s create an example application</h1>
          <p>To check if every part of your cluster is running as it should, let’s create an entire application. When set up, this application will provide a little web server running in multiple pods.</p>
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
          apiVersion: v1
          kind: ReplicationController
          metadata:
            name: helloworld
            labels:
              app: helloworld
          spec:
            replicas: 2
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

          <p>Save the above manifest in a file called helloworld-manifest.yaml</p>
          <p>🐣  If you’re new to Kubernetes: A manifest describes things to create in Kubernetes. In this case the manifest describes two different things, a ReplicationController and a Service. The ReplicationController ensures that a number of Pods (two, actually) containing Docker containers from a certain image are running. The Service is there to expose these containers inside your cluster via a certain hostname and port.</p>
          <p>Now use kubectl to create the Service and the ReplicationController:</p>

          <CodeBlock>
            <Prompt>
              {`kubectl create -f helloworld-manifest.yaml`}
            </Prompt>
            <Output>
              {`
                service "helloworld" created
                replicationcontroller "helloworld" created
              `}
            </Output>
          </CodeBlock>

          <p>The ReplicationController will create Pods with the Docker containers running. Once they are up, which should take only a few seconds, you can access them using this URL:</p>

          <a href="http://go9cdgqfnr.giantswarm-kaas.io/api/v1/proxy/namespaces/default/services/helloworld/" target="_blank">http://go9cdgqfnr.giantswarm-kaas.io/api/v1/proxy/namespaces/default/services/helloworld/</a>

          <p>This should show a little welcome message from the Giant Swarm team.</p>

          <button onClick={this.props.onPrevious}>Previous</button>
        </Slide>
      );
    }
});