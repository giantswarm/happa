import { FieldTemplateProps, RJSFSchema } from '@rjsf/utils';
import { Text } from 'grommet';
import React, { useMemo } from 'react';
import InputGroup from 'UI/Inputs/InputGroup';

import { IFormContext } from '..';
import AccordionFormField from '../AccordionFormField';
import ObjectFormField from '../ObjectFormField';

export function isTouchedField(id: string, touchedFields: string[]): boolean {
  return touchedFields.some((field) => field.includes(id));
}

const FieldTemplate: React.FC<
  FieldTemplateProps<RJSFSchema, RJSFSchema, IFormContext>
> = ({
  id,
  errors,
  rawErrors,
  children,
  label,
  schema,
  required,
  formContext,
}) => {
  const { type, description } = schema;

  const displayLabel = `${label}${required ? '*' : ''}`;

  const isRootItem = id === 'root';
  const isArrayItem = /(_\d+)$/.test(id);

  const showErrors = useMemo(() => {
    if (!formContext || formContext.showAllErrors) return true;

    return isTouchedField(id, formContext.touchedFields);
  }, [formContext, id]);

  if (isRootItem) {
    return children;
  }

  if (type === 'object' && isArrayItem) {
    return (
      <ObjectFormField
        label={displayLabel}
        help={description}
        error={rawErrors && showErrors ? errors : undefined}
        isArrayItem={isArrayItem}
      >
        {children}
      </ObjectFormField>
    );
  }

  if (type === 'array' || type === 'object') {
    return (
      <AccordionFormField
        label={displayLabel}
        help={description}
        error={rawErrors && showErrors ? errors : undefined}
      >
        {children}
      </AccordionFormField>
    );
  }

  return (
    <InputGroup
      label={displayLabel}
      help={<Text color='text-weak'>{description}</Text>}
      contentProps={{ width: { max: 'large' } }}
      error={rawErrors && showErrors ? errors : undefined}
      htmlFor={id}
    >
      {children}
    </InputGroup>
  );
};

export default FieldTemplate;
