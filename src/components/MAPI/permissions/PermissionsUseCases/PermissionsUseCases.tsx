import { Accordion, Box } from 'grommet';
import React, { useMemo, useState } from 'react';
import { Column } from 'UI/Display/MAPI/permissions/PermissionsUseCase/UseCase';
import UseCasesForCategory from 'UI/Display/MAPI/permissions/PermissionsUseCase/UseCasesForCategory';
import { groupBy } from 'underscore';

import { IPermissionsUseCase } from '../types';

interface IPermissionsUseCasesProps {
  useCases: IPermissionsUseCase[];
  useCasesStatuses: Record<string, Record<string, boolean>>;
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

  const categoriesStatuses: Record<
    string,
    Record<string, boolean | undefined>
  > = useMemo(() => {
    const statuses: Record<string, Record<string, boolean | undefined>> = {};
    categories.forEach((category) => {
      statuses[category] = {};
      const namespaces = organizations
        ? organizations.map((org) => org.id)
        : [''];

      namespaces.forEach((namespace) => {
        const values = useCasesByCategory[category].map(
          (useCase) => useCasesStatuses[useCase.name][namespace]
        );
        statuses[category][namespace] = values.every((v) => v === true)
          ? true
          : values.every((v) => v === false)
          ? false
          : undefined;
      });
    });

    return statuses;
  }, [categories, useCasesByCategory, useCasesStatuses, organizations]);

  const [activeIndexes, setActiveIndexes] = useState(
    categories.map((_, idx) => idx)
  );

  return (
    <Box
      margin={{ horizontal: 'small' }}
      pad={{ vertical: 'medium' }}
      overflow={{ horizontal: 'auto' }}
    >
      {organizations && (
        <Box direction='row' margin={{ bottom: 'medium' }}>
          <Column />
          {organizations.map((org) => (
            <Column key={org.id}>{org.id}</Column>
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
          <UseCasesForCategory
            category={category}
            useCases={useCasesByCategory[category]}
            statuses={categoriesStatuses[category]}
            organizations={organizations}
            isSelected={activeIndexes.includes(categoryIndex)}
            key={category}
          />
        ))}
      </Accordion>
    </Box>
  );
};

export default PermissionsUseCases;
