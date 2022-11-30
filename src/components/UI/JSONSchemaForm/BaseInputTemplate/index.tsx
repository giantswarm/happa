import { getInputProps, WidgetProps } from '@rjsf/utils';
import React from 'react';
import TextInput from 'UI/Inputs/TextInput';

const BaseInputTemplate: React.FC<WidgetProps> = (props) => {
  const {
    schema,
    // id,
    options,
    label,
    value,
    type,
    placeholder,
    required,
    disabled,
    readonly,
    autofocus,
    onChange,
    onBlur,
    onFocus,
    rawErrors,
    hideError,
    uiSchema,
    registry,
    formContext,
    ...rest
  } = props;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value === '' ? options.emptyValue || '' : e.target.value);
  };

  // const inputProps = { ...rest, ...getInputProps(schema, type, options) };]
  const inputProps = getInputProps(schema, type, options);

  return (
    <TextInput
      // id={id}
      // value={value}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      onChange={handleChange}
      {...inputProps}
    />
  );
};

export default BaseInputTemplate;
