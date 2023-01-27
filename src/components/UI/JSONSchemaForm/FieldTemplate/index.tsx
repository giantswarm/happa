import { FieldTemplateProps, RJSFSchema } from '@rjsf/utils';
import { FormField, Text } from 'grommet';
import React, { useContext, useMemo } from 'react';
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

  const showErrors = useMemo(() => {
    if (!formContext?.touchedFields) return false;

    return Array.from(formContext.touchedFields).some((field) =>
      field.includes(id)
    );
  }, [formContext?.touchedFields, id]);

  if (isRootItem) {
    return (
      <FormField
        label={displayLabel}
        help={description}
        error={rawErrors && showErrors ? errors : undefined}
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
      error={rawErrors && showErrors ? errors : undefined}
      htmlFor={id}
    >
      {children}
    </InputGroup>
  );
};

export default FieldTemplate;
