import {
  getInputProps,
  getSchemaType,
  RJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import React from 'react';
import SimpleNumberPicker from 'UI/Inputs/SimpleNumberPicker';
import TextArea from 'UI/Inputs/TextArea';
import TextInput from 'UI/Inputs/TextInput';

import { DEFAULT_NUMERIC_VALUE, DEFAULT_STRING_VALUE } from '../utils';

const BaseInputTemplate: React.FC<WidgetProps<RJSFSchema>> = ({
  id,
  schema,
  options,
  value,
  type,
  placeholder,
  disabled,
  readonly,
  required,
  onChange,
  onBlur,
}) => {
  const schemaType = getSchemaType(schema);
  const implicitDefaultValue =
    schemaType === 'string' ? DEFAULT_STRING_VALUE : DEFAULT_NUMERIC_VALUE;
  const emptyValue = options.emptyValue ?? implicitDefaultValue;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(e.target.value === '' ? emptyValue : e.target.value);
  };

  const handleNumberChange = (newValue: number) => {
    onChange(Number.isNaN(newValue) ? emptyValue : newValue);
  };

  const handleBlur = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onBlur(id, e.target.value === '' ? emptyValue : e.target.value);
  };

  const inputProps = getInputProps(schema, type as string, options);

  return schemaType === 'integer' ? (
    <SimpleNumberPicker
      id={id}
      error={null}
      value={value ?? NaN}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      required={required}
      min={inputProps.min}
      max={inputProps.max}
      step={inputProps.step}
      contentProps={{
        width: { max: 'small' },
      }}
      onChange={handleNumberChange}
      onBlur={handleBlur}
    />
  ) : schemaType === 'number' ? (
    <TextInput
      id={id}
      value={value ?? ''}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      required={required}
      onChange={handleChange}
      onBlur={handleBlur}
      {...inputProps}
    />
  ) : (
    <TextArea
      id={id}
      value={value ?? ''}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      required={required}
      onChange={handleChange}
      onBlur={handleBlur}
      spellCheck={false}
      resize={false}
      autoResizeHeight={true}
      {...inputProps}
    />
  );
};

export default BaseInputTemplate;
