import { RJSFSchema, WidgetProps } from '@rjsf/utils';
import React from 'react';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';

import { IFormContext } from '..';
import FieldDescription from '../FieldDescription';
import FieldLabel from '../FieldLabel';

const CheckboxWidget: React.FC<
  WidgetProps<RJSFSchema, RJSFSchema, IFormContext>
> = ({
  id,
  label,
  schema,
  required,
  value,
  formContext = {} as IFormContext,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
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
