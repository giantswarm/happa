import { getInputProps, WidgetProps } from '@rjsf/utils';
import React from 'react';
import NumberPicker from 'UI/Inputs/NumberPicker';
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

  const handleNumberChange = (patch: { value: number; valid: boolean }) => {
    if (patch.valid) {
      onChange(patch.value);
    }
  };

  const handleSuggestionSelect = (e: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    suggestion: any;
  }) => {
    onChange(e.suggestion);
  };

  const inputProps = getInputProps(schema, type as string, options);

  const { description, examples } = schema;

  const isArrayItem = /(_\d+)$/.test(id);
  const simplifiedView = isArrayItem && !description;

  const displayLabel = simplifiedView ? '' : label;

  const margin = {
    top: simplifiedView ? 'small' : 'none',
    bottom: 'small',
  };

  return inputProps.type === 'number' ? (
    <NumberPicker
      id={id}
      label={displayLabel}
      help={description}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      min={inputProps.min}
      max={inputProps.max}
      step={inputProps.step}
      margin={margin}
      contentProps={{
        width: { max: inputProps.type === 'number' ? 'small' : 'auto' },
      }}
      onChange={handleNumberChange}
    />
  ) : (
    <TextInput
      id={id}
      label={displayLabel}
      help={description}
      suggestions={examples as string[]}
      value={value ?? ''}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      margin={margin}
      onChange={handleChange}
      onSuggestionSelect={handleSuggestionSelect}
      {...inputProps}
    />
  );
};

export default BaseInputTemplate;
