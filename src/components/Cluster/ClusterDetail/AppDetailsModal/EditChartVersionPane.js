import FlashMessage from 'FlashMessages/FlashMessage';
import useError from 'lib/hooks/useError';
import PropTypes from 'prop-types';
import React from 'react';
import { updateClusterApp } from 'stores/clusterapps/actions';

const EditChartVersionPane = (props) => {
  const { errorMessage } = useError(updateClusterApp().types.error);

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
      {errorMessage && (
        <>
          <hr />
          Something went wrong while trying to set the chart version:
          <br />
          <br />
          <FlashMessage type='danger'>{errorMessage}</FlashMessage>
        </>
      )}
    </div>
  );
};

EditChartVersionPane.propTypes = {
  currentVersion: PropTypes.string,
  desiredVersion: PropTypes.string,
};

export default EditChartVersionPane;
