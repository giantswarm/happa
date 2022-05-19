import { AccordionPanel, Box, Text } from 'grommet';
import { IPermissionsUseCase } from 'MAPI/permissions/types';
import React from 'react';
import styled from 'styled-components';
import UseCaseLabel from 'UI/Display/MAPI/permissions/PermissionsUseCases/UseCaseLabel';

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
  isSelected: boolean;
  isLastCategory: boolean;
}

const UseCasesForCategory: React.FC<IUseCasesForCategoryProps> = ({
  category,
  useCases,
  isSelected,
  isLastCategory,
}) => {
  return (
    <AccordionPanel
      header={
        <Box direction='row' align='center' height='32px'>
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
      }
    >
      <Box
        margin={{
          top: 'medium',
          bottom: isLastCategory ? 'none' : 'medium',
        }}
        gap='medium'
      >
        {useCases.map((useCase) => (
          <UseCaseLabel useCase={useCase} key={useCase.name} />
        ))}
      </Box>
    </AccordionPanel>
  );
};

export default UseCasesForCategory;
