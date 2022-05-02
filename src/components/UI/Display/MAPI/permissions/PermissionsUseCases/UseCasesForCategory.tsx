import { AccordionPanel, Box, Text } from 'grommet';
import { IPermissionsUseCase } from 'MAPI/permissions/types';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import UseCase, {
  Column,
} from 'UI/Display/MAPI/permissions/PermissionsUseCases/UseCase';

import UseCaseStatus from './UseCaseStatus';

const LabelText = styled(Text)`
  text-transform: uppercase;
`;

interface IUseCasesForCategoryProps {
  category: string;
  useCases: IPermissionsUseCase[];
  statuses: Record<string, Record<string, boolean>>;
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
  const categoryStatuses = useMemo(() => {
    const statusesByNamespace: Record<string, boolean | undefined> = {};

    const namespaces = organizations
      ? organizations.map((org) => org.id)
      : [''];

    namespaces.forEach((namespace) => {
      const values = useCases.map(
        (useCase) => statuses?.[useCase.name][namespace]
      );
      statusesByNamespace[namespace] = values.every((v) => v === true)
        ? true
        : values.every((v) => v === false)
        ? false
        : undefined;
    });

    return statusesByNamespace;
  }, [organizations, statuses, useCases]);

  return (
    <AccordionPanel
      header={
        <Box direction='row'>
          <Column>
            <Box direction='row'>
              <LabelText margin={{ right: 'small' }}>{category}</LabelText>
              {!organizations && !isSelected && (
                <UseCaseStatus
                  value={categoryStatuses['']}
                  displayText={false}
                />
              )}
            </Box>
          </Column>
          {organizations &&
            !isSelected &&
            organizations.map((org) => (
              <Column key={org.id}>
                <UseCaseStatus value={categoryStatuses[org.id]} />
              </Column>
            ))}
        </Box>
      }
    >
      <Box margin={{ vertical: 'medium' }} gap='medium'>
        {useCases.map((useCase) => (
          <UseCase
            useCase={useCase}
            statuses={statuses[useCase.name]}
            organizations={organizations}
            key={useCase.name}
          />
        ))}
      </Box>
    </AccordionPanel>
  );
};

export default UseCasesForCategory;
