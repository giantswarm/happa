import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { Box } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

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

  return (
    <>
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
            bottom: 'small',
          }}
        >
          Add {title} item
        </Button>
      )}
    </>
  );
};

export default ArrayFieldTemplate;
