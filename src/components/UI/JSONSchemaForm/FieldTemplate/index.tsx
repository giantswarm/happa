import { FieldTemplateProps, RJSFSchema } from '@rjsf/utils';
import { ThemeContext, ThemeType } from 'grommet';
import React, { useMemo } from 'react';
import InputGroup from 'UI/Inputs/InputGroup';

import { IFormContext } from '..';
import AccordionFormField from '../AccordionFormField';
import FieldDescription from '../FieldDescription';
import FieldLabel from '../FieldLabel';
import ObjectFormField from '../ObjectFormField';
import { isTouchedField, mapErrorPropertyToField } from '../utils';

function getCustomTheme(error: React.ReactElement | undefined): ThemeType {
  return error
    ? {
        formField: {
          border: { color: 'text-error' },
        },
      }
    : {};
}

function getChildErrorsForField(
  formContext: IFormContext | undefined,
  id: string
) {
  if (!formContext || !formContext.errors) return [];

  return formContext.errors.filter((err) => {
    const errorPropertyAsField = mapErrorPropertyToField(
      err,
      formContext.idConfigs
    );

    return (
      // the suffix on the ID is required to eliminate false partial matches
      errorPropertyAsField.includes(
        `${id}${formContext.idConfigs.idSeparator}`
      ) && isTouchedField(errorPropertyAsField, formContext.touchedFields)
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
  formContext,
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

  const isRootItem = id === formContext?.idConfigs.idPrefix;
  const isArrayItem = /(_\d+)$/.test(id);

  const showErrors = useMemo(() => {
    if (!formContext) return true;

    return isTouchedField(id, formContext.touchedFields);
  }, [formContext, id]);

  const error = rawErrors && showErrors ? errors : undefined;

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
        contentProps={{ width: { max: 'large' } }}
        error={error}
        htmlFor={id}
      >
        {children}
      </InputGroup>
    </ThemeContext.Extend>
  );
};

export default FieldTemplate;
