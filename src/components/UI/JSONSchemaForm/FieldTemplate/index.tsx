import { FieldTemplateProps, RJSFSchema } from '@rjsf/utils';
import { ThemeContext, ThemeType } from 'grommet';
import React from 'react';
import InputGroup from 'UI/Inputs/InputGroup';

import { IFormContext } from '..';
import AccordionFormField from '../AccordionFormField';
import FieldDescription from '../FieldDescription';
import FieldLabel from '../FieldLabel';
import ObjectFormField from '../ObjectFormField';
import { isFieldArrayItem, mapErrorPropertyToField } from '../utils';

function getCustomTheme(error: React.ReactElement | undefined): ThemeType {
  return error
    ? {
        formField: {
          border: { color: 'text-error' },
        },
      }
    : {};
}

function getChildErrorsForField(formContext: IFormContext, id: string) {
  if (!formContext.errors) return [];

  return formContext.errors.filter((err) => {
    const errorPropertyAsField = mapErrorPropertyToField(
      err,
      formContext.idConfigs
    );

    return (
      // the suffix on the ID is required to eliminate false partial matches
      errorPropertyAsField.includes(`${id}${formContext.idConfigs.idSeparator}`)
    );
  });
}

const FieldTemplate: React.FC<
  FieldTemplateProps<RJSFSchema, RJSFSchema, IFormContext>
> = ({
  id,
  displayLabel,
  errors,
  rawErrors,
  children,
  label,
  schema,
  required,
  formContext = {} as IFormContext,
}) => {
  const { type, description } = schema;
  const { idPrefix, idSeparator } = formContext.idConfigs;

  const labelComponent = (
    <FieldLabel
      label={label}
      id={id}
      idSeparator={idSeparator}
      required={required}
      textProps={{ size: 'large', weight: 'bold' }}
    />
  );

  const descriptionComponent = <FieldDescription description={description} />;

  const isRootItem = id === idPrefix;
  const isArrayItem = isFieldArrayItem(id, idSeparator);

  const error = rawErrors ? errors : undefined;

  if (isRootItem) {
    return children;
  }

  if (type === 'object' && isArrayItem) {
    return (
      <ObjectFormField
        label={labelComponent}
        help={description && descriptionComponent}
        error={error}
        isArrayItem={isArrayItem}
      >
        {children}
      </ObjectFormField>
    );
  }

  if (type === 'array' || type === 'object') {
    const hasChildErrors = getChildErrorsForField(formContext, id).length > 0;

    return (
      <AccordionFormField
        label={labelComponent}
        help={description && descriptionComponent}
        error={error}
        hasChildErrors={hasChildErrors}
      >
        {children}
      </AccordionFormField>
    );
  }

  return (
    <ThemeContext.Extend value={getCustomTheme(error)}>
      <InputGroup
        label={displayLabel && labelComponent}
        help={displayLabel && description && descriptionComponent}
        width='large'
        error={error}
        htmlFor={id}
      >
        {children}
      </InputGroup>
    </ThemeContext.Extend>
  );
};

export default FieldTemplate;
