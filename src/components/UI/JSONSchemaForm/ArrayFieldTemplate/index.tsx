import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { Accordion, AccordionPanel, Box, Text } from 'grommet';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import Button from 'UI/Controls/Button';

const StyledButton = styled(Button)`
  height: 40px;
`;

const Icon = styled(Text)<{ isActive?: boolean }>`
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: 0.15s ease-out;
`;

const ArrayItemsWrapper = styled(Box)<{ itemsAreObjects?: boolean }>`
  width: 100%;
  margin-bottom: -10px;

  ${({ itemsAreObjects }) =>
    !itemsAreObjects &&
    css`
      label {
        display: none;
      }
    `}
`;

const ArrayFieldTemplate: React.FC<ArrayFieldTemplateProps> = ({
  items,
  canAdd,
  title,
  schema,
  onAddClick,
}) => {
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);

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
          pad='medium'
          round='xsmall'
        >
          <Box gap={itemsAreObjects ? 'large' : 'small'}>
            {items.map((element) => (
              <Box key={element.key} direction='row' gap='small'>
                <ArrayItemsWrapper itemsAreObjects={itemsAreObjects}>
                  {element.children}
                </ArrayItemsWrapper>
                <StyledButton
                  icon={<i className='fa fa-delete' />}
                  onClick={element.onDropIndexClick(element.index)}
                />
              </Box>
            ))}
          </Box>
          {canAdd && (
            <Button
              icon={<i className='fa fa-add-circle' />}
              onClick={onAddClick}
              margin={{
                top:
                  items.length > 0
                    ? itemsAreObjects
                      ? 'large'
                      : 'medium'
                    : 'none',
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
