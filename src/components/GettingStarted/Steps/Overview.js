import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import Button from 'UI/Controls/Button';
import GettingStartedBottomNav from 'UI/Display/Documentation/GettingStartedBottomNav';

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

    <GettingStartedBottomNav>
      <Link to={props.steps[0].url}>
        <Button
          primary={true}
          icon={<i className='fa fa-chevron-right' />}
          reverse={true}
        >
          Start
        </Button>
      </Link>
    </GettingStartedBottomNav>
  </>
);

Overview.propTypes = {
  steps: PropTypes.array,
};

export default Overview;
