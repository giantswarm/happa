import { AccordionPanel, Box, Text } from 'grommet';
import { IPermissionsUseCase } from 'MAPI/permissions/types';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import UseCase, {
  Column,
} from 'UI/Display/MAPI/permissions/PermissionsUseCases/UseCase';

import UseCaseStatus from './UseCaseStatus';

const Icon = styled(Text)<{ isActive?: boolean }>`
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: 0.15s ease-out;
`;

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
  const namespaces = useMemo(
    () => (organizations ? organizations.map((org) => org.id) : ['']),
    [organizations]
  );

  const categoryStatuses = useMemo(() => {
    const statusesByNamespace: Record<string, boolean | undefined> = {};

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
  }, [namespaces, statuses, useCases]);

  return (
    <AccordionPanel
      header={
        <Box direction='row'>
          <Column>
            <Box direction='row' align='center'>
              <Icon
                className='fa fa-chevron-down'
                isActive={isSelected}
                role='presentation'
                aria-hidden='true'
                size='28px'
                margin={{ right: 'xsmall' }}
              />
              <LabelText>{category}</LabelText>
            </Box>
          </Column>
          {!isSelected &&
            namespaces.map((namespace) => (
              <Column key={namespace}>
                <UseCaseStatus value={categoryStatuses[namespace]} />
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
