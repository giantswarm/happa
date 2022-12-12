import { getInputProps, WidgetProps } from '@rjsf/utils';
import React from 'react';
import TextInput from 'UI/Inputs/TextInput';

const BaseInputTemplate: React.FC<WidgetProps> = ({
  id,
  label,
  schema,
  options,
  value,
  type,
  placeholder,
  disabled,
  readonly,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value === '' ? options.emptyValue || '' : e.target.value);
  };

  const inputProps = getInputProps(schema, type as string, options);

  const isArrayItem = /(-\d+)$/.test(label);

  return (
    <TextInput
      id={id}
      label={isArrayItem ? undefined : label}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      onChange={handleChange}
      {...inputProps}
    />
  );
};

export default BaseInputTemplate;
