import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { Box } from 'grommet';
import React from 'react';
import Button from 'UI/Controls/Button';
import InputGroup from 'UI/Inputs/InputGroup';

const ArrayFieldTemplate: React.FC<ArrayFieldTemplateProps> = ({
  items,
  canAdd,
  title,
  onAddClick,
}) => {
  return (
    <InputGroup label={title}>
      <div>
        {items.map((element) => (
          <Box key={element.key} direction='row'>
            <Box fill={true}>{element.children}</Box>
            <Button
              icon={<i className='fa fa-delete' />}
              onClick={element.onDropIndexClick(element.index)}
            >
              Delete
            </Button>
          </Box>
        ))}
        {canAdd && (
          <Button
            icon={<i className='fa fa-add-circle' />}
            onClick={onAddClick}
          >
            Add
          </Button>
        )}
      </div>
    </InputGroup>
  );
};

export default ArrayFieldTemplate;
