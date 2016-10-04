'use strict';
import React from 'react';
import Slide from '../component_slider/slide';
import Markdown from './markdown';
import { CodeBlock, Prompt, Output } from './codeblock';
import FileBlock from './fileblock';
import {connect} from 'react-redux';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import { flashAdd } from '../../actions/flashMessageActions';
import _ from 'underscore';

var SimpleExample = React.createClass ({
    getInitialState: function() {
      return {
        loading: true
      };
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
          console.log(error);
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

    linkToHelloWorld: function() {
      if (this.state.loading === 'failed') {
        return 'Could not figure out the url for your hello world app. Sorry.';
      } else if (this.state.loading) {
        return 'Figuring out the url...';
      } else {
        var url = `helloworld.default.${this.props.cluster.name}.k8s.gigantic.io`;
        return (
          <a href={url} target='_blank'>{url}</a>
        );
      }
    },

    render() {
      return (
        <Slide>
          <h1>Let&apos;s create an example application</h1>
          <p>To check if every part of your cluster is running as it should, let&apos;s create an entire application. When set up, this application will provide a little web server running in multiple pods.</p>
          <p>Here is the manifest we need:</p>

          <FileBlock fileName='helloworld-manifest.yaml'>
          {`
          apiVersion: v1
          kind: Service
          metadata:
            name: helloworld
            labels:
              app: helloworld
            namespace: default
          spec:
            type: NodePort
            ports:
            - port: 8080
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
                namespace: default
              spec:
                containers:
                - name: helloworld
                  image: giantswarm/helloworld:latest
                  ports:
                  - containerPort: 8080
          ---
          apiVersion: extensions/v1beta1
          kind: Ingress
          metadata:
            labels:
              app: helloworld 
            name: helloworld
            namespace: default
          spec:
            backend:
              serviceName: helloworld
              servicePort: 8080
          `}
          </FileBlock>

          <p><i className='fa fa-graduation-cap' title='For learners'></i> If you&apos;re new to Kubernetes: A manifest describes things to create in Kubernetes. In this case the manifest describes two different things, a service and a deployment. The service is there to expose containers (here: the ones with the label app: helloworld) inside your cluster via a certain hostname and port. The deployment describes your helloworld deployment. It manages a replica set, which ensures that a number of pods (two, actually) containing Docker containers from a certain image are running.</p>
          <p>Now use <code>kubectl</code> to create the service, deployment, and ingress resource:</p>

          <CodeBlock>
            <Prompt>
              {`kubectl apply --filename https://raw.githubusercontent.com/giantswarm/helloworld/master/helloworld-manifest.yaml`}
            </Prompt>
            <Output>
              {`
                service 'helloworld' created
                deployment 'helloworld' created
                ingress "helloworld" created
              `}
            </Output>
          </CodeBlock>

          <p>The deployment will create a replica set, which in turn will create pods with the Docker containers running. Once they are up, which should take only a few seconds, you can access them using this URL:</p>

          { this.linkToHelloWorld() }

          <p>This should show a little welcome message from the Giant Swarm team.</p>

          <button className='primary' onClick={this.props.goToSlide.bind(null, 'inspecting')}>Continue</button><br/>
          <button onClick={this.props.goToSlide.bind(null, 'configure')}>Previous</button>
        </Slide>
      );
    }
});

function mapStateToProps(state, ownProps) {
  var selectedOrganization = state.entities.organizations.items[state.app.selectedOrganization];
  var clustersByDate = _.sortBy(selectedOrganization.clusters, 'create_date').reverse();
  var firstClusterId = clustersByDate[0];
  var firstCluster = state.entities.clusters.items[firstClusterId];

  return {
    cluster: firstCluster
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SimpleExample);
