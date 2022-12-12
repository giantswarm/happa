import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { Box, BoxProps, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import InputGroup from 'UI/Inputs/InputGroup';

const StyledButton = styled(Button)`
  height: 40px;
`;

const ArrayFieldTemplate: React.FC<ArrayFieldTemplateProps> = ({
  items,
  canAdd,
  title,
  schema,
  onAddClick,
}) => {
  const itemsAreObjects =
    schema.items &&
    typeof schema.items !== 'boolean' &&
    !Array.isArray(schema.items) &&
    schema.items.type === 'object';

  const containerProps: BoxProps = itemsAreObjects
    ? {
        border: 'all',
        pad: { top: 'small', bottom: 'medium', horizontal: 'medium' },
        round: 'xsmall',
      }
    : {};

  return (
    <InputGroup
      label={<Text size='medium'>{title}</Text>}
      margin={{ bottom: 'medium' }}
    >
      <Box margin={{ bottom: 'medium' }} gap='medium'>
        {items.length === 0 && (
          <Box
            pad='medium'
            round='xsmall'
            border='all'
            align='center'
            justify='center'
          >
            No items added
          </Box>
        )}
        {items.map((element) => (
          <Box
            key={element.key}
            direction='row'
            gap='medium'
            {...containerProps}
          >
            <Box fill={true} margin={{ bottom: '-10px' }}>
              {element.children}
            </Box>
            <StyledButton
              icon={<i className='fa fa-delete' />}
              onClick={element.onDropIndexClick(element.index)}
              margin={{ top: itemsAreObjects ? 'small' : 'none' }}
            />
          </Box>
        ))}
      </Box>
      {canAdd && (
        <Button icon={<i className='fa fa-add-circle' />} onClick={onAddClick}>
          Add
        </Button>
      )}
    </InputGroup>
  );
};

export default ArrayFieldTemplate;
