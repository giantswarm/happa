import { EnumOptionsType, WidgetProps } from '@rjsf/utils';
import React from 'react';
import Select from 'UI/Inputs/Select';

const SelectWidget: React.FC<WidgetProps> = ({
  id,
  label,
  options,
  schema,
  value,
  onChange,
}) => {
  const handleChange = (option: EnumOptionsType) => {
    onChange(option.value);
  };

  const selectedOption = options.enumOptions?.find(
    (option) => option.value === value
  );

  const { description } = schema;

  return (
    <Select
      id={id}
      label={label}
      value={selectedOption}
      help={description}
      onChange={(e) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        handleChange(e.option);
      }}
      options={options.enumOptions || []}
    />
  );
};

export default SelectWidget;
