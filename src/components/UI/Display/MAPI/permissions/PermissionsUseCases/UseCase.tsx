import { Box, Text } from 'grommet';
import { IPermissionsUseCase } from 'MAPI/permissions/types';
import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

import UseCaseStatus from './UseCaseStatus';

export const Column = styled.div`
  display: flex;
  justify-content: center;
  width: 100px;
  min-width: 100px;
  text-align: center;

  &:first-child {
    width: 256px;
    min-width: 256px;
    justify-content: flex-start;
  }
`;

interface IUseCaseProps {
  useCase: IPermissionsUseCase;
  statuses: Record<string, boolean | undefined>;
  organizations?: IOrganization[];
}

const UseCase: React.FC<IUseCaseProps> = ({
  useCase,
  statuses,
  organizations,
}) => {
  return (
    <Box direction='row'>
      <Column>
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
      </Column>
      {organizations ? (
        organizations.map((org) => (
          <Column key={org.id}>
            <UseCaseStatus value={statuses[org.id]} />
          </Column>
        ))
      ) : (
        <Column>
          <UseCaseStatus value={statuses['']} />
        </Column>
      )}
    </Box>
  );
};

export default UseCase;
