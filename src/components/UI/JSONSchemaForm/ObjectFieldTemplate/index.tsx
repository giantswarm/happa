import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { Accordion, AccordionPanel, Box, FormField, Text } from 'grommet';
import React, { useState } from 'react';
import styled from 'styled-components';

const Icon = styled(Text)<{ isActive?: boolean }>`
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: 0.15s ease-out;
  font-size: 28px;
  line-height: 20px;
  margin-left: -6px;
`;

const ObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = ({
  idSchema,
  schema,
  title,
  properties,
}) => {
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);

  const isRootItem = title === '';
  const isArrayItem = /(_\d+)$/.test(idSchema.$id);

  const { description } = schema;

  if (isRootItem || isArrayItem) {
    return (
      <FormField
        label={title !== '' ? title : undefined}
        help={title !== '' && description ? description : undefined}
        contentProps={{ border: false }}
        margin={{ bottom: isArrayItem ? 'none' : 'small' }}
      >
        {properties.map((element) => (
          <div key={element.name}>{element.content}</div>
        ))}
      </FormField>
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
          <Box>
            <Box direction='row' align='center' margin={{ vertical: 'small' }}>
              <Icon
                className='fa fa-chevron-down'
                isActive={activeIndexes.includes(0)}
                role='presentation'
                aria-hidden='true'
              />
              <Text weight='bold'>{title}</Text>
            </Box>
            {description && (
              <Text size='small' color='text-weak' margin={{ bottom: 'small' }}>
                {description}
              </Text>
            )}
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
