import { FieldTemplateProps, RJSFSchema } from '@rjsf/utils';
import { FormField, Text } from 'grommet';
import React, { useContext } from 'react';
import InputGroup from 'UI/Inputs/InputGroup';

import { FormContext, IFormContext } from '..';
import AccordionFormField from '../AccordionFormField';
import ObjectFormField from '../ObjectFormField';

const FieldTemplate: React.FC<
  FieldTemplateProps<RJSFSchema, RJSFSchema, IFormContext>
> = ({ id, errors, rawErrors, children, label, schema, required }) => {
  const { type, description } = schema;

  const displayLabel = `${label}${required ? '*' : ''}`;

  const isRootItem = id === 'root';
  const isArrayItem = /(_\d+)$/.test(id);

  const formContext = useContext(FormContext);

  if (isRootItem) {
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
        onInactive={() => formContext?.setTouchedField(id)}
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
