import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import Button from 'UI/Button';

const Overview = (props) => (
  <>
    <h1>Get started with your Kubernetes cluster</h1>
    <ol className='step_selector'>
      {props.steps.map(({ url, title, description }, i) => (
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
      <Link to={props.steps[0].url}>
        <Button bsStyle='primary'>
          Start <i className='fa fa-chevron-right' />
        </Button>
      </Link>
    </div>
  </>
);

Overview.propTypes = {
  steps: PropTypes.array,
};

export default Overview;
