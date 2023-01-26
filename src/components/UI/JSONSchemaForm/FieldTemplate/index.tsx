import { FieldTemplateProps } from '@rjsf/utils';
import { Text } from 'grommet';
import React from 'react';
import InputGroup from 'UI/Inputs/InputGroup';

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
        error={rawErrors ? errors : undefined}
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
        error={rawErrors ? errors : undefined}
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
      error={rawErrors ? errors : undefined}
      htmlFor={id}
    >
      {children}
    </InputGroup>
  );
};

export default FieldTemplate;
