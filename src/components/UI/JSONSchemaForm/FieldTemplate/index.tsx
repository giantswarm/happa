import {
  FieldTemplateProps,
  RJSFSchema,
  RJSFValidationError,
} from '@rjsf/utils';
import { ThemeContext, ThemeType } from 'grommet';
import React, { useMemo } from 'react';
import InputGroup from 'UI/Inputs/InputGroup';

import { IFormContext } from '..';
import AccordionFormField from '../AccordionFormField';
import FieldDescription from '../FieldDescription';
import FieldLabel from '../FieldLabel';
import ObjectFormField from '../ObjectFormField';
import { mapErrorPropertyToField } from '../utils';

function getCustomTheme(error: React.ReactElement | undefined): ThemeType {
  return error
    ? {
        formField: {
          border: { color: 'text-error' },
        },
      }
    : {};
}
export function isTouchedField(id: string, touchedFields: string[]): boolean {
  return touchedFields.some((field) => `${field}_`.includes(`${id}_`));
}

function getChildErrorsForField(
  errors: RJSFValidationError[] | undefined,
  touchedFields: string[] | undefined,
  showErrors: boolean | undefined,
  id: string
) {
  if (!errors || !touchedFields) return [];

  return errors.filter((err) => {
    const errorPropertyAsField = mapErrorPropertyToField(err);

    return (
      // the suffix on the ID is required to eliminate false partial matches
      errorPropertyAsField.includes(`${id}_`) &&
      (isTouchedField(errorPropertyAsField, touchedFields) || showErrors)
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

  const isRootItem = id === 'root';
  const isArrayItem = /(_\d+)$/.test(id);

  const showErrors = useMemo(() => {
    if (!formContext || formContext.showAllErrors) return true;

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
    const hasChildErrors =
      getChildErrorsForField(
        formContext?.errors,
        formContext?.touchedFields,
        formContext?.showAllErrors,
        id
      ).length > 0;

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
