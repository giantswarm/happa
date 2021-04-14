import PropTypes from 'prop-types';
import React from 'react';
import { FlashMessageType } from 'styles';
import FlashMessage from 'UI/Display/FlashMessage';

interface IEditChartVersionPaneProps {
  currentVersion: string;
  desiredVersion: string;
  errorMessage?: string;
}

const EditChartVersionPane: React.FC<IEditChartVersionPaneProps> = ({
  currentVersion,
  desiredVersion,
  errorMessage,
}) => {
  return (
    <div>
      Current chart version: <code>{currentVersion}</code>
      <br />
      <br />
      Desired chart version: <code>{desiredVersion}</code>
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
          <FlashMessage type={FlashMessageType.Danger}>
            {errorMessage}
          </FlashMessage>
        </>
      )}
    </div>
  );
};

EditChartVersionPane.propTypes = {
  currentVersion: PropTypes.string.isRequired,
  desiredVersion: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
};

export default EditChartVersionPane;
