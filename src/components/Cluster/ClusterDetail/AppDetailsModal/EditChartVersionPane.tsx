import { Box, Text } from 'grommet';
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
    <Box direction='column' gap='medium'>
      <Text>
        Current chart version: <code>{currentVersion}</code>
      </Text>
      <Text>
        Desired chart version: <code>{desiredVersion}</code>
      </Text>
      <Text>
        <i
          className='fa fa-warning'
          role='presentation'
          aria-hidden='true'
          aria-label='Breaking changes'
        />{' '}
        There could be breaking changes between chart versions. It is up to you
        to verify if you are picking a valid upgrade or downgrade path.
      </Text>
      {errorMessage && (
        <Box
          border={{ side: 'top' }}
          pad={{ top: 'small' }}
          direction='column'
          gap='small'
          margin={{ top: 'small' }}
        >
          <Text>
            Something went wrong while trying to set the chart version:
          </Text>
          <FlashMessage type={FlashMessageType.Danger}>
            {errorMessage}
          </FlashMessage>
        </Box>
      )}
    </Box>
  );
};

EditChartVersionPane.propTypes = {
  currentVersion: PropTypes.string.isRequired,
  desiredVersion: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
};

export default EditChartVersionPane;
