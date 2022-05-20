import { Accordion, Box, Text } from 'grommet';
import {
  IPermissionsUseCase,
  PermissionsUseCaseStatuses,
} from 'MAPI/permissions/types';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import StatusesForCategory, {
  Column,
} from 'UI/Display/MAPI/permissions/PermissionsUseCases/StatusesForCategory';
import UseCasesForCategory from 'UI/Display/MAPI/permissions/PermissionsUseCases/UseCasesForCategory';
import UseCasesPreloader from 'UI/Display/MAPI/permissions/PermissionsUseCases/UseCasesPreloader';
import Truncated from 'UI/Util/Truncated';
import { groupBy } from 'underscore';
import { getTruncationParams } from 'utils/helpers';

import ScrollableContainer from './ScrollableContainer';

const ORGANIZATION_MAX_LENGTH = 30;
const ORGANIZATION_LABEL_HEIGHT = 60;

const OrganizationLabel = styled(Text)`
  font-weight: 700;
  overflow-wrap: anywhere;
`;

interface IPermissionsUseCasesProps {
  useCases: IPermissionsUseCase[];
  useCasesStatuses?: PermissionsUseCaseStatuses;
  organizations?: IOrganization[];
  activeIndexes: number[];
  onActive: (activeIndexes: number[]) => void;
}

const PermissionsUseCases: React.FC<IPermissionsUseCasesProps> = ({
  useCases,
  useCasesStatuses,
  organizations,
  activeIndexes,
  onActive,
}) => {
  const [categories, useCasesByCategory] = useMemo(() => {
    const groupedUseCases = groupBy(useCases, 'category');
    const sortedCategories = Object.keys(groupedUseCases).sort((a, b) =>
      a.localeCompare(b)
    );

    return [sortedCategories, groupedUseCases];
  }, [useCases]);

  if (!useCasesStatuses) {
    return <UseCasesPreloader />;
  }

  return (
    <Box direction='row' pad={{ vertical: 'medium' }}>
      <Accordion
        multiple={true}
        gap='medium'
        width={{ min: '256px' }}
        margin={{
          top: organizations ? `${ORGANIZATION_LABEL_HEIGHT}px` : '0',
        }}
        activeIndex={activeIndexes}
        onActive={onActive}
        animate={false}
        role='presentation'
        aria-hidden='true'
      >
        {categories.map((category, categoryIndex) => (
          <UseCasesForCategory
            category={category}
            useCases={useCasesByCategory[category]}
            isSelected={activeIndexes.includes(categoryIndex)}
            isLastCategory={categoryIndex === categories.length - 1}
            key={category}
          />
        ))}
      </Accordion>
      <ScrollableContainer>
        {organizations && (
          <Box direction='row' role='presentation' aria-hidden='true'>
            {organizations.map((org) => (
              <Column
                key={org.id}
                height={`${ORGANIZATION_LABEL_HEIGHT}px`}
                justify='start'
              >
                <Truncated
                  as={OrganizationLabel}
                  {...getTruncationParams(ORGANIZATION_MAX_LENGTH)}
                >
                  {org.id}
                </Truncated>
              </Column>
            ))}
          </Box>
        )}
        <Accordion
          multiple={true}
          gap='medium'
          activeIndex={activeIndexes}
          onActive={onActive}
          animate={false}
        >
          {categories.map((category, categoryIndex) => (
            <StatusesForCategory
              category={category}
              useCases={useCasesByCategory[category]}
              statuses={useCasesStatuses}
              organizations={organizations}
              isSelected={activeIndexes.includes(categoryIndex)}
              isLastCategory={categoryIndex === categories.length - 1}
              key={category}
            />
          ))}
        </Accordion>
      </ScrollableContainer>
    </Box>
  );
};

export default PermissionsUseCases;
