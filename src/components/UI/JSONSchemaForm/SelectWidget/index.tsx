import { EnumOptionsType, getSchemaType, WidgetProps } from '@rjsf/utils';
import { Box } from 'grommet';
import React, { useMemo } from 'react';
import Select from 'UI/Inputs/Select';

import { DEFAULT_NUMERIC_VALUE, DEFAULT_STRING_VALUE } from '../utils';

const SelectWidget: React.FC<WidgetProps> = ({
  id,
  disabled,
  options: { emptyValue, enumOptions },
  required,
  value,
  schema,
  onChange,
}) => {
  const handleChange = (option: EnumOptionsType) => {
    onChange(option.value);
  };

  const options = useMemo(() => {
    const schemaType = getSchemaType(schema);
    const implicitDefaultValue =
      schemaType === 'string' ? DEFAULT_STRING_VALUE : DEFAULT_NUMERIC_VALUE;
    const emptyOptionValue =
      schema.default !== undefined
        ? emptyValue ?? implicitDefaultValue
        : undefined;

    const selectOptions = [
      {
        label: '',
        value: emptyOptionValue,
      },
    ];

    if (enumOptions) {
      enumOptions.forEach((option: EnumOptionsType) =>
        selectOptions.push({
          label: option.label,
          value: option.value,
        })
      );
    }

    return selectOptions;
  }, [emptyValue, enumOptions, schema]);

  const selectedOption = options.find((option) => option.value === value);
  const selectedIndex = selectedOption
    ? options.indexOf(selectedOption)
    : undefined;

  return (
    <Select
      id={id}
      value={selectedOption}
      disabled={disabled}
      required={required}
      onChange={(e) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        handleChange(e.option);
      }}
      options={options}
      selected={selectedIndex ? [selectedIndex] : undefined}
    >
      {({ label }: EnumOptionsType) => (
        <Box
          pad='small'
          height={{ min: '35px' }}
          aria-label={label === '' ? 'empty value' : undefined}
        >
          {label}
        </Box>
      )}
    </Select>
  );
};

export default SelectWidget;
