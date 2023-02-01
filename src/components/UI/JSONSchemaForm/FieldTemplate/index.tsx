import { FieldTemplateProps } from '@rjsf/utils';
import React from 'react';
import InputGroup from 'UI/Inputs/InputGroup';

import AccordionFormField from '../AccordionFormField';
import FieldDescription from '../FieldDescription';
import FieldLabel from '../FieldLabel';
import ObjectFormField from '../ObjectFormField';

const FieldTemplate: React.FC<FieldTemplateProps> = ({
  id,
  displayLabel,
  errors,
  rawErrors,
  children,
  label,
  schema,
  required,
}) => {
  const { type, description } = schema;

  const labelComponent = (
    <FieldLabel
      label={label}
      id={id}
      required={required}
      textProps={{ size: 'large', weight: 'bold' }}
    />
  );

  const descriptionComponent = <FieldDescription description={description} />;

  const isRootItem = id === 'root';
  const isArrayItem = /(_\d+)$/.test(id);

  if (isRootItem) {
    return children;
  }

  if (type === 'object' && isArrayItem) {
    return (
      <ObjectFormField
        label={labelComponent}
        help={description && descriptionComponent}
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
        label={labelComponent}
        help={description && descriptionComponent}
        error={rawErrors ? errors : undefined}
      >
        {children}
      </AccordionFormField>
    );
  }

  return (
    <InputGroup
      label={displayLabel && labelComponent}
      help={displayLabel && description && descriptionComponent}
      contentProps={{ width: { max: 'large' } }}
      error={rawErrors ? errors : undefined}
      htmlFor={id}
    >
      {children}
    </InputGroup>
  );
};

export default FieldTemplate;
