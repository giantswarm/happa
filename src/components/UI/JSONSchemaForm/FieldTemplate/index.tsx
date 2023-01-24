import { FieldTemplateProps } from '@rjsf/utils';
import { FormField } from 'grommet';
import React from 'react';

import AccordionFormField from '../AccordionFormField';
import ObjectFormField from '../ObjectFormField';

const FieldTemplate: React.FC<FieldTemplateProps> = ({
  id,
  errors,
  rawErrors,
  children,
  label,
  schema,
  required,
}) => {
  const { type, description } = schema;

  const displayLabel = `${label}${required ? '*' : ''}`;

  const isRootItem = id === 'root';
  const isArrayItem = /(_\d+)$/.test(id);

  if (isRootItem) {
    return children;
  }

  if (type === 'object' && isArrayItem) {
    return (
      <ObjectFormField
        label={displayLabel}
        help={description}
        error={errors}
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
        error={errors}
      >
        {children}
      </AccordionFormField>
    );
  }

  return (
    <FormField
      label={displayLabel}
      help={description}
      error={rawErrors ? errors : undefined}
      htmlFor={id}
      contentProps={{ border: false }}
    >
      {children}
    </FormField>
  );
};

export default FieldTemplate;
