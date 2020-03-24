import PropTypes from 'prop-types';
import React from 'react';

const EditChartVersionPane = (props) => {
  return (
    <>
      Current chart version: <code>{props.currentVersion}</code>
      <br />
      <br />
      Desired chart version: <code>{props.desiredVersion}</code>
      <br />
      <br />
      <i className='fa fa-warning' /> There could be breaking changes between
      chart versions. It is up to you to verify if you are picking a valid
      upgrade or downgrade path.
    </>
  );
};

EditChartVersionPane.propTypes = {
  currentVersion: PropTypes.string,
  desiredVersion: PropTypes.string,
};

export default EditChartVersionPane;
