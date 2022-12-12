import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { Accordion, AccordionPanel, Box, Text } from 'grommet';
import React, { useState } from 'react';
import styled from 'styled-components';
import InputGroup from 'UI/Inputs/InputGroup';

const Icon = styled(Text)<{ isActive?: boolean }>`
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: 0.15s ease-out;
`;

const ObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = ({
  title,
  properties,
}) => {
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);

  const isRootItem = title === '';
  const isArrayItem = /(-\d+)$/.test(title);

  if (isRootItem || isArrayItem) {
    return (
      <InputGroup label={title === '' ? undefined : title}>
        {properties.map((element) => (
          <div key={element.name}>{element.content}</div>
        ))}
      </InputGroup>
    );
  }

  return (
    <Accordion
      activeIndex={activeIndexes}
      onActive={setActiveIndexes}
      animate={false}
    >
      <AccordionPanel
        header={
          <Box direction='row' align='center' height='40px'>
            <Icon
              className='fa fa-chevron-down'
              isActive={activeIndexes.includes(0)}
              role='presentation'
              aria-hidden='true'
              size='28px'
              margin={{ right: 'xsmall' }}
            />
            <Text weight='bold'>{title}</Text>
          </Box>
        }
      >
        <Box
          margin={{
            bottom: 'medium',
          }}
          border='all'
          pad={{ top: 'small', bottom: 'medium', horizontal: 'medium' }}
          round='xsmall'
        >
          {properties.map((element) => (
            <div key={element.name}>{element.content}</div>
          ))}
        </Box>
      </AccordionPanel>
    </Accordion>
  );
};

export default ObjectFieldTemplate;
