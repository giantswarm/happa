import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

class Overview extends React.Component {
  render() {
    return (
      <div className='centered col-10'>
        <h1>Get started with your Kubernetes cluster</h1>
        <ol className='step_selector'>
          {this.props.steps.map(({ url, title, description }, i) => (
            <li key={title}>
              <Link to={url}>
                <span className='step_selector--step-number'>{i + 1}.</span>
                <span className='step_selector--step-title'>{title}</span>
                <span className='step_selector--step-description'>
                  {description}
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className='component_slider--nav'>
          <Link to={this.props.steps[0].url}>
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
  steps: PropTypes.array,
};

export default Overview;
