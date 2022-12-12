import { EnumOptionsType, WidgetProps } from '@rjsf/utils';
import React from 'react';
import Select from 'UI/Inputs/Select';

const SelectWidget: React.FC<WidgetProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const handleChange = (option: EnumOptionsType) => {
    onChange(option.value);
  };

  const selectedOption = options.enumOptions?.find(
    (option) => option.value === value
  );

  return (
    <Select
      label={label}
      value={selectedOption}
      onChange={(e) => {
        handleChange(e.option);
      }}
      options={options.enumOptions || []}
    />
  );
};

export default SelectWidget;
