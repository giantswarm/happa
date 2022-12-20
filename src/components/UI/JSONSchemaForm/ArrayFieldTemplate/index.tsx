import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { Accordion, AccordionPanel, Box, Text } from 'grommet';
import React, { useState } from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

const StyledButton = styled(Button)`
  height: 40px;
`;

const Icon = styled(Text)<{ isActive?: boolean }>`
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: 0.15s ease-out;
  font-size: 28px;
  line-height: 20px;
  margin-left: -6px;
`;

const ArrayFieldTemplate: React.FC<ArrayFieldTemplateProps> = ({
  items,
  canAdd,
  title,
  schema,
  onAddClick,
}) => {
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);

  const { description } = schema;

  const itemsAreObjects =
    schema.items &&
    typeof schema.items !== 'boolean' &&
    !Array.isArray(schema.items) &&
    schema.items.type === 'object';

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
            bottom: 'small',
          }}
          border='all'
          pad={{ top: 'small', bottom: 'medium', horizontal: 'medium' }}
          round='xsmall'
        >
          <Box
            gap={itemsAreObjects ? 'large' : 'none'}
            border={itemsAreObjects ? 'between' : false}
          >
            {items.map((element) => (
              <Box key={element.key} direction='row' gap='small'>
                <Box fill>{element.children}</Box>
                <StyledButton
                  icon={<i className='fa fa-delete' />}
                  onClick={element.onDropIndexClick(element.index)}
                  margin={{ top: 'small' }}
                />
              </Box>
            ))}
          </Box>
          {canAdd && (
            <Button
              icon={<i className='fa fa-add-circle' />}
              onClick={onAddClick}
              margin={{
                top: items.length > 0 ? 'medium' : 'small',
              }}
            >
              Add {title} item
            </Button>
          )}
        </Box>
      </AccordionPanel>
    </Accordion>
  );
};

export default ArrayFieldTemplate;
