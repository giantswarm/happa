import { AccordionPanel, Box } from 'grommet';
import { IPermissionsUseCase } from 'MAPI/permissions/types';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import UseCaseStatus from './UseCaseStatus';

export const Column = styled(Box)`
  align-items: center;
  width: 100px;
  min-width: 100px;
  text-align: center;
`;

interface IUseCasesForCategoryProps {
  useCases: IPermissionsUseCase[];
  statuses: Record<string, Record<string, boolean>>;
  organizations?: IOrganization[];
  isSelected: boolean;
}

const StatusesForCategory: React.FC<IUseCasesForCategoryProps> = ({
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
        <Box direction='row' height='32px'>
          {!isSelected &&
            namespaces.map((namespace) => (
              <Column key={namespace} justify='center'>
                <UseCaseStatus value={categoryStatuses[namespace]} />
              </Column>
            ))}
        </Box>
      }
    >
      <Box margin={{ vertical: 'medium' }} gap='medium'>
        {useCases.map((useCase) => (
          <Box direction='row' key={useCase.name}>
            {namespaces.map((namespace) => (
              <Column key={namespace} justify='center'>
                <UseCaseStatus value={statuses[useCase.name][namespace]} />
              </Column>
            ))}
          </Box>
        ))}
      </Box>
    </AccordionPanel>
  );
};

export default StatusesForCategory;
