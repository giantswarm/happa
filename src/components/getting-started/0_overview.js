import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

class Overview extends React.Component {
  testFileContent() {
    return `
      The contents of the file

      Indentation
      -----------
        Indentation should be preserved based on where the first line
        started in the code.
    `;
  }

  render() {
    return (
      <div className='centered col-10'>
        <h1>Get started with your Kubernetes cluster</h1>
        <ol className='step_selector'>
          <li>
            <Link
              to={`/organizations/${this.props.match.params.orgId}/clusters/${this.props.match.params.clusterId}/getting-started/configure/`}
            >
              <span className='step_selector--step-number'>1.</span>
              <span className='step_selector--step-title'>Get access</span>
              <span className='step_selector--step-description'>
                Enable your Kubernetes CLI to access your Kubernetes cluster at
                Giant Swarm
              </span>
            </Link>
          </li>
          <li>
            <Link
              to={`/organizations/${this.props.match.params.orgId}/clusters/${this.props.match.params.clusterId}/getting-started/example/`}
            >
              <span className='step_selector--step-number'>2.</span>
              <span className='step_selector--step-title'>
                Run a simple example
              </span>
              <span className='step_selector--step-description'>
                To make sure everything works as expected, let&apos;s start a
                hello world application
              </span>
            </Link>
          </li>
          <li>
            <Link
              to={`/organizations/${this.props.match.params.orgId}/clusters/${this.props.match.params.clusterId}/getting-started/next-steps/`}
            >
              <span className='step_selector--step-number'>3.</span>
              <span className='step_selector--step-title'>Next steps</span>
              <span className='step_selector--step-description'>
                We point you to some useful next best actions, like setting up
                the Kubernetes dashboard
              </span>
            </Link>
          </li>
        </ol>

        <div className='component_slider--nav'>
          <Link
            to={`/organizations/${this.props.match.params.orgId}/clusters/${this.props.match.params.clusterId}/getting-started/configure/`}
          >
            <button className='primary' type='button'>
              Start <i className='fa fa-chevron-right' />
            </button>
          </Link>
        </div>
      </div>
    );
  }
}

Overview.propTypes = {
  match: PropTypes.object,
  goToSlide: PropTypes.func,
};

export default Overview;
