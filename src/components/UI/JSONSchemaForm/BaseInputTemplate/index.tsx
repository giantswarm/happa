import { getInputProps, WidgetProps } from '@rjsf/utils';
import React from 'react';
import NumberPicker from 'UI/Inputs/NumberPicker';
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
    onChange(e.target.value === '' ? options.emptyValue : e.target.value);
  };

  const handleNumberChange = (patch: { value: number; valid: boolean }) => {
    onChange(!patch.valid ? options.emptyValue : patch.value);
  };

  const handleBlur = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onBlur(id, e.target.value === '' ? options.emptyValue : e.target.value);
  };

  const inputProps = getInputProps(schema, type as string, options);

  return schema.type === 'integer' ? (
    <NumberPicker
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
      onBlur={handleBlur}
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
