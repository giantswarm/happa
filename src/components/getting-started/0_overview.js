'use strict';
import React from 'react';
import Slide from '../component_slider/slide';
import Markdown from './markdown';
import {Link}  from 'react-router';

class Overview extends React.Component {
  testFileContent() {
    return (`
      The contents of the file

      Indentation
      -----------
        Indentation should be preserved based on where the first line
        started in the code.
    `);
  }

  render() {
    return (
      <Slide>

        <Markdown>
          {`
          # Get started with your Kubernetes cluster
          `}
        </Markdown>
        <ol className="step_selector row">
          <li className="col-3 col-6-sm">
            <Link to="/getting-started/download">
              <span className="step_selector--step-number">1.</span>
              <span className="step_selector--step-title">Install kubectl</span>
              <span className="step_selector--step-description">Ensure that you have the most recent version of Kubernetes CLI installed</span>
            </Link>
          </li>
          <li className="col-3 col-6-sm">
            <Link to="/getting-started/configure">
              <span className="step_selector--step-number">2.</span>
              <span className="step_selector--step-title">Get access</span>
              <span className="step_selector--step-description">Enable your Kubernetes CLI to access your Kubernetes cluster at Giant Swarm</span>
            </Link>
          </li>
          <li className="col-3 col-6-sm">
            <Link to="/getting-started/example">
              <span className="step_selector--step-number">3.</span>
              <span className="step_selector--step-title">Run a simple example</span>
              <span className="step_selector--step-description">To make sure everything works as expected, let's start a hello world application</span>
            </Link>
          </li>
          <li className="col-3 col-6-sm">
            <Link to="/getting-started/next-steps">
              <span className="step_selector--step-number">4.</span>
              <span className="step_selector--step-title">Next steps</span>
              <span className="step_selector--step-description">We point you to some useful next best actions, like setting up the Kubernetes dashboard</span>
            </Link>
          </li>
        </ol>

        <div className="component_slider--nav">
        <button className="primary" onClick={this.props.goToSlide.bind(null, 'download')}>Start <i className="fa fa-caret-right"></i></button>
        </div>
      </Slide>
    );
  }
}

Overview.propTypes = {
  goToSlide: React.PropTypes.func
};

export default Overview;
