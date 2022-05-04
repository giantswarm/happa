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

const RelativeBox = styled(Box)`
  position: relative;
`;

interface IUseCasesForCategoryProps {
  category: string;
  useCases: IPermissionsUseCase[];
  statuses: Record<string, Record<string, boolean>>;
  organizations?: IOrganization[];
  isSelected: boolean;
}

const StatusesForCategory: React.FC<IUseCasesForCategoryProps> = ({
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
        <RelativeBox direction='row' height='32px' aria-label={category}>
          {!isSelected &&
            namespaces.map((namespace) => (
              <Column key={namespace} justify='center'>
                <UseCaseStatus
                  useCaseName={category}
                  organizationName={namespace}
                  value={categoryStatuses[namespace]}
                />
              </Column>
            ))}
        </RelativeBox>
      }
    >
      <Box margin={{ vertical: 'medium' }} gap='medium'>
        {useCases.map((useCase) => (
          <Box direction='row' key={useCase.name}>
            {namespaces.map((namespace) => (
              <Column key={namespace} justify='center'>
                <UseCaseStatus
                  useCaseName={useCase.name}
                  organizationName={namespace}
                  value={statuses[useCase.name][namespace]}
                />
              </Column>
            ))}
          </Box>
        ))}
      </Box>
    </AccordionPanel>
  );
};

export default StatusesForCategory;
