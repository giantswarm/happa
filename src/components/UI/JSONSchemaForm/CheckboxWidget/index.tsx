import { RJSFSchema, WidgetProps } from '@rjsf/utils';
import React from 'react';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';

import { IFormContext } from '..';
import FieldDescription from '../FieldDescription';
import FieldLabel from '../FieldLabel';
import { DEFAULT_BOOLEAN_VALUE } from '../utils';

const CheckboxWidget: React.FC<
  WidgetProps<RJSFSchema, RJSFSchema, IFormContext>
> = ({
  id,
  label,
  schema,
  options,
  required,
  value,
  formContext = {} as IFormContext,
  onChange,
}) => {
  const implicitDefaultValue = DEFAULT_BOOLEAN_VALUE;
  const emptyValue =
    schema.default !== undefined
      ? options.emptyValue ?? implicitDefaultValue
      : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked === false ? emptyValue : e.target.checked);
  };

  const labelComponent = (
    <FieldLabel
      label={label}
      id={id}
      idSeparator={formContext.idConfigs.idSeparator}
      required={required}
    />
  );

  const { description } = schema;
  const descriptionComponent = <FieldDescription description={description} />;

  return (
    <CheckBoxInput
      id={id}
      checked={value}
      label={labelComponent}
      help={description && descriptionComponent}
      margin={{ vertical: 'small' }}
      contentProps={{ pad: 'none' }}
      onChange={handleChange}
    />
  );
};

export default CheckboxWidget;
