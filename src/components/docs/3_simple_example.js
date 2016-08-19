'use strict';
import React from 'react';
import Reflux from 'reflux';
import Slide from '../component_slider/slide';
import Markdown from './markdown';
import { CodeBlock, Prompt, Output } from './codeblock';
import FileBlock from './fileblock';
import ClusterStore from '../../stores/cluster_store.js';
import ClusterActions from '../../actions/cluster_actions.js';

module.exports = React.createClass ({
    mixins: [Reflux.connect(ClusterStore,'clusters'), Reflux.listenerMixin],

    componentDidMount: function() {
      if (this.state.clusters === "NOTLOADED") {
        ClusterActions.fetchAll();
      }
    },

    linkToHelloWorld: function() {
      if (this.state.clusters === "NOTLOADED") {
        return "Figuring out the url...";
      } else if (this.state.clusters === "LOADINGFAILED") {
        return "Could not figure out the url for your hello world app. Sorry.";
      } else {
        var url = `${this.state.clusters[0].api_endpoint}/api/v1/proxy/namespaces/default/services/helloworld/`;
        return (
          <a href={url} target="_blank">{url}</a>
        );
      }
    },

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
          <p><i className="fa fa-graduation-cap" title="For learners"></i> If you&apos;re new to Kubernetes: A manifest describes things to create in Kubernetes. In this case the manifest describes two different things, a service and a deployment. The service is there to expose containers (here: the ones with the label app: helloworld) inside your cluster via a certain hostname and port. The deployment describes your helloworld deployment. It manages a replica set, which ensures that a number of pods (two, actually) containing Docker containers from a certain image are running.</p>
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

          { this.linkToHelloWorld() }

          <p>This should show a little welcome message from the Giant Swarm team.</p>

          <button className="primary" onClick={this.props.goToSlide.bind(null, 'inspecting')}>Continue</button><br/>
          <button onClick={this.props.goToSlide.bind(null, 'configure')}>Previous</button>
        </Slide>
      );
    }
});