'use strict';
import React from 'react';
import Slide from '../component_slider/slide';

class NextSteps extends React.Component {
    render() {
      return (
        <Slide>
          <h1>Where to go from here?</h1>

          <p>Now that you have a running Kubernetes cluster, you can use it to deploy anything you like on it.</p>

          <p>We recommend to <a href='https://blog.giantswarm.io/getting-started-with-a-local-kubernetes-environment/' target='_blank'>choose a local development environment</a> so you can test your apps before deploying to your Giant Swarm cluster.</p>

          <p>If you have not done so already, you should get acquainted with the <a href='https://blog.giantswarm.io/understanding-basic-kubernetes-concepts-i-introduction-to-pods-labels-replicas/' target='_blank'>basic concepts of Kubernetes</a>.</p>

          <p>Last but not least, you should check out our <a href='https://docs.giantswarm.io/' target='_blank'>Documentation</a>, including an <a href='https://docs.giantswarm.io/basics/kubernetes-fundamentals/' target='_blank'>overview of Kubernetes Fundamentals</a> and a selection of <a href='https://docs.giantswarm.io/guides/' target='_blank'>User Guides</a> that help you set up Monitoring, Logging, and more.</p>

          <div className="component_slider--nav">
            <button onClick={this.props.goToSlide.bind(null, 'example')}><i className="fa fa-caret-left"></i> Back</button>
          </div>
        </Slide>
      );
    }
}

NextSteps.propTypes = {
  goToSlide: React.PropTypes.func
};

export default NextSteps;