import { Accordion, Box } from 'grommet';
import { IPermissionsUseCase } from 'MAPI/permissions/types';
import React, { useMemo, useState } from 'react';
import StatusesForCategory, {
  Column,
} from 'UI/Display/MAPI/permissions/PermissionsUseCases/StatusesForCategory';
import UseCasesForCategory from 'UI/Display/MAPI/permissions/PermissionsUseCases/UseCasesForCategory';
import UseCasesPreloader from 'UI/Display/MAPI/permissions/PermissionsUseCases/UseCasesPreloader';
import { groupBy } from 'underscore';

import ScrollableContainer from './ScrollableContainer';

const ORGANIZATION_LABEL_HEIGHT = 60;

interface IPermissionsUseCasesProps {
  useCases: IPermissionsUseCase[];
  useCasesStatuses?: Record<string, Record<string, boolean>>;
  organizations?: IOrganization[];
}

const PermissionsUseCases: React.FC<IPermissionsUseCasesProps> = ({
  useCases,
  useCasesStatuses,
  organizations,
}) => {
  const [categories, useCasesByCategory] = useMemo(() => {
    const groupedUseCases = groupBy(useCases, 'category');

    return [Object.keys(groupedUseCases), groupedUseCases];
  }, [useCases]);

  const [activeIndexes, setActiveIndexes] = useState(
    categories.map((_, idx) => idx)
  );

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
        onActive={setActiveIndexes}
        animate={false}
      >
        {categories.map((category, categoryIndex) => (
          <UseCasesForCategory
            category={category}
            useCases={useCasesByCategory[category]}
            isSelected={activeIndexes.includes(categoryIndex)}
            key={category}
          />
        ))}
      </Accordion>
      <ScrollableContainer>
        {organizations && (
          <Box direction='row'>
            {organizations.map((org) => (
              <Column
                key={org.id}
                height={`${ORGANIZATION_LABEL_HEIGHT}px`}
                justify='start'
              >
                {org.id}
              </Column>
            ))}
          </Box>
        )}
        <Accordion
          multiple={true}
          gap='medium'
          activeIndex={activeIndexes}
          onActive={setActiveIndexes}
          animate={false}
        >
          {categories.map((category, categoryIndex) => (
            <StatusesForCategory
              useCases={useCasesByCategory[category]}
              statuses={useCasesStatuses}
              organizations={organizations}
              isSelected={activeIndexes.includes(categoryIndex)}
              key={category}
            />
          ))}
        </Accordion>
      </ScrollableContainer>
    </Box>
  );
};

export default PermissionsUseCases;
