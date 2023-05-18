import { RJSFValidationError } from '@rjsf/utils';
import { Box, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

import { IFormContext } from '..';
import { isTouchedField, mapErrorPropertyToField } from '../utils';
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
  formContext: IFormContext;
}

const ValidationStatus: React.FC<IValidationStatusProps> = ({
  formContext,
}) => {
  const filteredErrors = useMemo(() => {
    return formContext.errors?.filter((e) =>
      isTouchedField(
        mapErrorPropertyToField(e, formContext.idConfigs),
        formContext.touchedFields,
        formContext.idConfigs.idSeparator
      )
    );
  }, [formContext]);

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
        {filteredErrors && filteredErrors.length > 0 ? (
          <Box direction='row' align='center' gap='xsmall'>
            <StyledStatusIcon
              className='fa fa-close'
              aria-hidden={true}
              role='presentation'
              color='text-error'
            />
            <Text color='text-error'>{formatErrorText(filteredErrors)}</Text>
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
      {filteredErrors && filteredErrors.length > 0 && (
        <ErrorList errors={filteredErrors} />
      )}
    </Box>
  );
};

export default ValidationStatus;
