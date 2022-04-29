import { Accordion, AccordionPanel, Box, Text } from 'grommet';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import theme from 'styles/theme';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
import { groupBy } from 'underscore';

import { IPermissionsUseCase } from '../types';

const Column = styled.div`
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

const LabelText = styled(Text)`
  text-transform: uppercase;
`;

const Icon = styled(Text)`
  font-size: 20px;
`;

const IconSmall = styled(Text)`
  font-size: 17px;
`;

interface IStatusProps {
  value?: boolean;
  displayText?: boolean;
}

const Status: React.FC<IStatusProps> = ({ value, displayText = true }) => (
  <Box direction='row' align='center'>
    {typeof value === 'undefined' ? (
      <IconSmall
        className='fa fa-radio-checked'
        role='presentation'
        aria-hidden='true'
      />
    ) : (
      <Icon
        color={value ? theme.colors.greenNew : theme.colors.error}
        className={value ? 'fa fa-check-circle' : 'fa fa-close-circle'}
        role='presentation'
        aria-hidden='true'
      />
    )}

    {displayText && typeof value !== 'undefined' && (
      <Text
        color={value ? theme.colors.greenNew : theme.colors.error}
        size='16px'
        margin={{ left: 'small' }}
      >
        {value ? 'Yes' : 'No'}
      </Text>
    )}
  </Box>
);

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
          <AccordionPanel
            key={category}
            header={
              <Box direction='row'>
                <Column>
                  <Box direction='row'>
                    <LabelText margin={{ right: 'small' }}>
                      {category}
                    </LabelText>
                    {!organizations &&
                      !activeIndexes.includes(categoryIndex) && (
                        <Status
                          value={categoriesStatuses[category]['']}
                          displayText={false}
                        />
                      )}
                  </Box>
                </Column>
                {organizations &&
                  !activeIndexes.includes(categoryIndex) &&
                  organizations.map((org) => (
                    <Column key={org.id}>
                      <Status value={categoriesStatuses[category][org.id]} />
                    </Column>
                  ))}
              </Box>
            }
          >
            <Box margin={{ vertical: 'medium' }} gap='medium'>
              {useCasesByCategory[category].map((useCase) => (
                <Box direction='row' key={useCase.name}>
                  <Column>
                    <Box
                      direction='row'
                      align='center'
                      margin={{ left: 'medium' }}
                    >
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
                        <i
                          className='fa fa-info'
                          role='presentation'
                          aria-hidden='true'
                        />
                      </TooltipContainer>
                    </Box>
                  </Column>
                  {organizations ? (
                    organizations.map((org) => (
                      <Column key={org.id}>
                        <Status
                          value={useCasesStatuses[useCase.name][org.id]}
                        />
                      </Column>
                    ))
                  ) : (
                    <Column>
                      <Status value={useCasesStatuses[useCase.name]['']} />
                    </Column>
                  )}
                </Box>
              ))}
            </Box>
          </AccordionPanel>
        ))}
      </Accordion>
    </Box>
  );
};

export default PermissionsUseCases;
