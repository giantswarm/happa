import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { Accordion, AccordionPanel, Box, Text } from 'grommet';
import React, { useState } from 'react';
import styled from 'styled-components';

const Icon = styled(Text)<{ isActive?: boolean }>`
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: 0.15s ease-out;
`;

const ObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = ({
  idSchema,
  title,
  properties,
}) => {
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);

  const isRootItem = title === '';
  const isArrayItem = /(_\d+)$/.test(idSchema.$id);

  if (isRootItem || isArrayItem) {
    return (
      <Box>
        {title !== '' && (
          <Text weight='bold' margin={{ bottom: 'small' }}>
            {title}
          </Text>
        )}
        {properties.map((element) => (
          <div key={element.name}>{element.content}</div>
        ))}
      </Box>
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
          pad={{ vertical: 'small', horizontal: 'medium' }}
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
