import { getInputProps, WidgetProps } from '@rjsf/utils';
import React from 'react';
import SimpleNumberPicker from 'UI/Inputs/SimpleNumberPicker';
import TextArea from 'UI/Inputs/TextArea';
import TextInput from 'UI/Inputs/TextInput';

const BaseInputTemplate: React.FC<WidgetProps> = ({
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
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const emptyValue = options.emptyValue ?? '';
    onChange(e.target.value === '' ? emptyValue : e.target.value);
  };

  const handleNumberChange = (newValue: number) => {
    onChange(Number.isNaN(newValue) ? options.emptyValue : newValue);
  };

  const handleBlur = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const emptyValue = options.emptyValue ?? '';
    onBlur(id, e.target.value === '' ? emptyValue : e.target.value);
  };

  const handleNumberBlur = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onBlur(id, e.target.value === '' ? options.emptyValue : e.target.value);
  };

  const inputProps = getInputProps(schema, type as string, options);

  return schema.type === 'integer' ? (
    <SimpleNumberPicker
      id={id}
      error={null}
      value={value}
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
      onBlur={handleNumberBlur}
    />
  ) : inputProps.type === 'text' ? (
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
  ) : (
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
  );
};

export default BaseInputTemplate;
