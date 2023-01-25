import { getInputProps, WidgetProps } from '@rjsf/utils';
import React from 'react';
import NumberPicker from 'UI/Inputs/NumberPicker';
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
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value === '' ? options.emptyValue : e.target.value);
  };

  const handleNumberChange = (patch: { value: number; valid: boolean }) => {
    if (patch.valid) {
      onChange(patch.value);
    }
  };

  const handleSuggestionSelect = (e: { suggestion: string }) => {
    onChange(e.suggestion);
  };

  const inputProps = getInputProps(schema, type as string, options);

  const { examples } = schema;

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
      margin={{ bottom: 'none' }}
      contentProps={{
        width: { max: 'small' },
      }}
      onChange={handleNumberChange}
    />
  ) : (
    <TextInput
      id={id}
      suggestions={examples as string[]}
      value={value ?? ''}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      required={required}
      margin={{ bottom: 'none' }}
      onChange={handleChange}
      onSuggestionSelect={handleSuggestionSelect}
      {...inputProps}
    />
  );
};

export default BaseInputTemplate;
