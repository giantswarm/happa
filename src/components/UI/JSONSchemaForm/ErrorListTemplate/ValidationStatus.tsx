import { RJSFValidationError } from '@rjsf/utils';
import { Box, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

import ErrorList from './ErrorList';

const StyledStatusIcon = styled.i<{ color: string }>`
  display: inline-block;
  font-size: 24px;
  color: ${({ theme, color }) => normalizeColor(color, theme)};
`;

function formatErrorText(errors: RJSFValidationError[]) {
  return `${errors.length} error${errors.length > 1 ? 's' : ''} found`;
}

interface IValidationStatusProps {
  errors: RJSFValidationError[];
}

const ValidationStatus: React.FC<IValidationStatusProps> = ({ errors }) => {
  return (
    <Box
      gap='small'
      margin={{ top: 'small' }}
      pad={{ top: 'medium' }}
      border='top'
    >
      <Box direction='row' align='center' gap='medium'>
        <Box direction='row' align='baseline' gap='xsmall'>
          <Text>Validation result</Text>
          <TooltipContainer
            content={
              <Tooltip>
                {`As a first step, the form data is validated against the cluster app's schema.`}
              </Tooltip>
            }
          >
            <i className='fa fa-info' aria-hidden={true} role='presentation' />
          </TooltipContainer>
        </Box>
        {errors.length > 0 ? (
          <Box direction='row' align='center' gap='xsmall'>
            <StyledStatusIcon
              className='fa fa-close'
              aria-hidden={true}
              role='presentation'
              color='text-error'
            />
            <Text color='text-error'>{formatErrorText(errors)}</Text>
          </Box>
        ) : (
          <Box direction='row' align='center' gap='xsmall'>
            <StyledStatusIcon
              color='text-success'
              className='fa fa-done'
              aria-hidden={true}
              role='presentation'
            />
            <Text color='text-success'>OK</Text>
          </Box>
        )}
      </Box>
      {errors.length > 0 && <ErrorList errors={errors} />}
    </Box>
  );
};

export default ValidationStatus;
