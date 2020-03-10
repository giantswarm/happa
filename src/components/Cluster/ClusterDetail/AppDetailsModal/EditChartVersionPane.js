import PropTypes from 'prop-types';
import React from 'react';

const EditChartVersionPane = props => {
  return (
    <>
      Current chart version: {props.currentVersion}
      <br />
      <br />
      Desired chart version: {props.desiredVersion}
      <br />
      <br />
      <b>Attention:</b> There might be breaking changes between chart versions.
      We currently list all versions regardless of compatibility. It is up to
      you to verify if you are picking a valid upgrade or downgrade path.
    </>
  );
};

EditChartVersionPane.propTypes = {
  currentVersion: PropTypes.string,
  desiredVersion: PropTypes.string,
};

export default EditChartVersionPane;
