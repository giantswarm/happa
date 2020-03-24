import PropTypes from 'prop-types';
import React from 'react';

const EditChartVersionPane = (props) => {
  return (
    <div data-testid='edit-chart-version-pane'>
      Current chart version: <code>{props.currentVersion}</code>
      <br />
      <br />
      Desired chart version: <code>{props.desiredVersion}</code>
      <br />
      <br />
      <i className='fa fa-warning' /> There could be breaking changes between
      chart versions. It is up to you to verify if you are picking a valid
      upgrade or downgrade path.
      {props.clusterUpdateAppError && (
        <>
          <hr />
          Something went wrong while trying to scale your node pool:
          <br />
          <br />
          <div className='flash-messages--flash-message flash-messages--danger'>
            {props.clusterUpdateAppError}
          </div>
        </>
      )}
    </div>
  );
};

EditChartVersionPane.propTypes = {
  currentVersion: PropTypes.string,
  desiredVersion: PropTypes.string,
  clusterUpdateAppError: PropTypes.string,
};

export default EditChartVersionPane;
