import { AccordionPanel, Box, Text } from 'grommet';
import { IPermissionsUseCase } from 'MAPI/permissions/types';
import React from 'react';
import styled from 'styled-components';
import UseCase, {
  Column,
} from 'UI/Display/MAPI/permissions/PermissionsUseCase/UseCase';

import UseCaseStatus from './UseCaseStatus';

const LabelText = styled(Text)`
  text-transform: uppercase;
`;

interface IUseCasesForCategoryProps {
  category: string;
  useCases: IPermissionsUseCase[];
  statuses: Record<string, boolean | undefined>;
  organizations?: IOrganization[];
  isSelected: boolean;
}

const UseCasesForCategory: React.FC<IUseCasesForCategoryProps> = ({
  category,
  useCases,
  statuses,
  organizations,
  isSelected,
}) => {
  return (
    <AccordionPanel
      header={
        <Box direction='row'>
          <Column>
            <Box direction='row'>
              <LabelText margin={{ right: 'small' }}>{category}</LabelText>
              {!organizations && !isSelected && (
                <UseCaseStatus value={statuses['']} displayText={false} />
              )}
            </Box>
          </Column>
          {organizations &&
            !isSelected &&
            organizations.map((org) => (
              <Column key={org.id}>
                <UseCaseStatus value={statuses[org.id]} />
              </Column>
            ))}
        </Box>
      }
    >
      <Box margin={{ vertical: 'medium' }} gap='medium'>
        {useCases.map((useCase) => (
          <UseCase
            useCase={useCase}
            statuses={statuses}
            organizations={organizations}
            key={useCase.name}
          />
        ))}
      </Box>
    </AccordionPanel>
  );
};

export default UseCasesForCategory;
