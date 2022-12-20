import { getInputProps, WidgetProps } from '@rjsf/utils';
import { Box } from 'grommet';
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

  const inputProps = getInputProps(schema, type as string, options);

  const { description } = schema;

  const isArrayItem = /(_\d+)$/.test(id);
  const simplifiedView = isArrayItem && !description;

  const displayLabel = simplifiedView ? '' : label;

  return (
    <Box
      margin={{ top: simplifiedView ? 'small' : 'none' }}
      width={{ max: inputProps.type === 'number' ? 'small' : 'auto' }}
    >
      {inputProps.type === 'number' ? (
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
          onChange={handleNumberChange}
        />
      ) : (
        <TextInput
          id={id}
          label={displayLabel}
          help={description}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          onChange={handleChange}
          {...inputProps}
        />
      )}
    </Box>
  );
};

export default BaseInputTemplate;
