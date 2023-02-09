import {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
  RJSFSchema,
} from '@rjsf/utils';
import { Box } from 'grommet';
import React, { useMemo } from 'react';
import Button from 'UI/Controls/Button';

import { IFormContext } from '..';
import ArrayFieldItem from '../ArrayFieldItem';

function getArrayItemFieldId(
  parentId: string,
  idx: number,
  idSeparator: string
) {
  return `${parentId}${idSeparator}${idx}`;
}
function shouldReorder(fields: string[], field1: string, field2: string) {
  return fields.includes(field1) !== fields.includes(field2);
}

const ArrayFieldTemplate: React.FC<
  ArrayFieldTemplateProps<RJSFSchema, RJSFSchema, IFormContext>
> = ({
  items,
  canAdd,
  onAddClick,
  idSchema,
  formContext = {} as IFormContext,
}) => {
  const getArrayItemFieldIdFn = useMemo(() => {
    return (idx: number) => {
      return getArrayItemFieldId(
        idSchema.$id,
        idx,
        formContext.idConfigs.idSeparator
      );
    };
  }, [formContext, idSchema.$id]);

  const reorderFields = (idx: number, newIdx: number) => {
    const fieldAtIdx = getArrayItemFieldIdFn(idx);
    const fieldAtNewIdx = getArrayItemFieldIdFn(newIdx);
    if (shouldReorder(formContext.touchedFields, fieldAtIdx, fieldAtNewIdx)) {
      formContext.toggleTouchedFields(fieldAtIdx, fieldAtNewIdx);
    }
  };

  const removeField = (idx: number) => {
    const fieldsToToggle = [];
    for (let i = idx; i < items.length - 1; i++) {
      const fieldAtIdx = getArrayItemFieldIdFn(i);
      const fieldAtNextIdx = getArrayItemFieldIdFn(i + 1);

      if (
        shouldReorder(formContext.touchedFields, fieldAtIdx, fieldAtNextIdx)
      ) {
        fieldsToToggle.push(fieldAtIdx);
      }
    }

    const fieldAtLastIdx = getArrayItemFieldIdFn(items.length - 1);
    if (formContext.touchedFields.includes(fieldAtLastIdx)) {
      fieldsToToggle.push(fieldAtLastIdx);
    }

    formContext.toggleTouchedFields(...fieldsToToggle);
  };

  const handleDrop =
    (
      idx: number,
      onDropidxClick: (event?: React.MouseEvent<HTMLElement>) => void
    ) =>
    (event?: React.MouseEvent<HTMLElement>) => {
      removeField(idx);

      return onDropidxClick(event);
    };

  const handleReorder =
    (
      idx: number,
      newIdx: number,
      onReorderClick: (event?: React.MouseEvent<HTMLElement>) => void
    ) =>
    (event?: React.MouseEvent<HTMLElement>) => {
      reorderFields(idx, newIdx);

      return onReorderClick(event);
    };

  return (
    <>
      <Box>
        {items &&
          items.map(
            ({
              key,
              onDropIndexClick,
              onReorderClick,
              ...itemProps
            }: ArrayFieldTemplateItemType) => (
              <ArrayFieldItem
                key={key}
                onDropIndexClick={(idx) =>
                  handleDrop(idx, onDropIndexClick(idx))
                }
                onReorderClick={(oldidx, newIdx) =>
                  handleReorder(oldidx, newIdx, onReorderClick(oldidx, newIdx))
                }
                {...itemProps}
              />
            )
          )}
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
