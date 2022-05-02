import { Accordion, Box } from 'grommet';
import { IPermissionsUseCase } from 'MAPI/permissions/types';
import React, { useMemo, useState } from 'react';
import { Column } from 'UI/Display/MAPI/permissions/PermissionsUseCases/UseCase';
import UseCasesForCategory from 'UI/Display/MAPI/permissions/PermissionsUseCases/UseCasesForCategory';
import { groupBy } from 'underscore';

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
      {useCasesStatuses ? (
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
              statuses={useCasesStatuses}
              organizations={organizations}
              isSelected={activeIndexes.includes(categoryIndex)}
              key={category}
            />
          ))}
        </Accordion>
      ) : (
        <div>loading placeholder</div>
      )}
    </Box>
  );
};

export default PermissionsUseCases;
