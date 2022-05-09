import { Box, Text } from 'grommet';
import { IPermissionsUseCase } from 'MAPI/permissions/types';
import React from 'react';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

interface IUseCaseLabelProps {
  useCase: IPermissionsUseCase;
}

const UseCaseLabel: React.FC<IUseCaseLabelProps> = ({ useCase }) => {
  return (
    <Box direction='row' align='center' margin={{ left: '33px' }}>
      <Text margin={{ right: 'small' }}>{useCase.name}</Text>
      <TooltipContainer
        content={
          <Tooltip>
            <Text
              size='xsmall'
              color='text-strong'
              textAlign='center'
              wordBreak='break-word'
              dangerouslySetInnerHTML={{
                __html: useCase.description!,
              }}
            />
          </Tooltip>
        }
      >
        <i className='fa fa-info' role='presentation' aria-hidden='true' />
      </TooltipContainer>
    </Box>
  );
};

export default UseCaseLabel;
