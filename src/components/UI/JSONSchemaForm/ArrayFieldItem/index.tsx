import { ArrayFieldTemplateItemType } from '@rjsf/utils';
import { Box } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React from 'react';
import styled from 'styled-components';

import ArrayFieldItemActions from '../ArrayFieldItemActions';

const ArrayFieldItemWrapper = styled(Box)`
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    border-left: 1px solid ${({ theme }) => normalizeColor('border', theme)};
  }
`;

const ArrayFieldItemActionsWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  width: 35px;
  padding-top: 10px;
`;

const ArrayFieldItem: React.FC<ArrayFieldTemplateItemType> = ({
  disabled,
  index,
  hasMoveDown,
  hasMoveUp,
  hasRemove,
  hasToolbar,
  readonly,
  onDropIndexClick,
  onReorderClick,
  children,
}) => {
  return (
    <ArrayFieldItemWrapper direction='row'>
      <ArrayFieldItemActionsWrapper>
        {hasToolbar && (
          <ArrayFieldItemActions
            disabled={disabled || readonly}
            hasMoveDown={hasMoveDown}
            hasMoveUp={hasMoveUp}
            hasRemove={hasRemove}
            onMoveUpClick={onReorderClick(index, index - 1)}
            onMoveDownClick={onReorderClick(index, index + 1)}
            onDropClick={onDropIndexClick(index)}
          />
        )}
      </ArrayFieldItemActionsWrapper>
      <Box fill>{children}</Box>
    </ArrayFieldItemWrapper>
  );
};

export default ArrayFieldItem;
