import {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
} from '@rjsf/utils';
import { Box } from 'grommet';
import React from 'react';
import Button from 'UI/Controls/Button';

import ArrayFieldItem from '../ArrayFieldItem';

const ArrayFieldTemplate: React.FC<ArrayFieldTemplateProps> = ({
  items,
  canAdd,
  onAddClick,
}) => {
  return (
    <>
      <Box>
        {items &&
          items.map(({ key, ...itemProps }: ArrayFieldTemplateItemType) => (
            <ArrayFieldItem key={key} {...itemProps} />
          ))}
      </Box>
      {canAdd && (
        <Button
          onClick={onAddClick}
          wrapperProps={{ alignSelf: 'start', margin: { vertical: 'small' } }}
        >
          Add
        </Button>
      )}
    </>
  );
};

export default ArrayFieldTemplate;
