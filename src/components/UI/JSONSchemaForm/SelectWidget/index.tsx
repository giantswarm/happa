import { EnumOptionsType, WidgetProps } from '@rjsf/utils';
import React from 'react';
import Select from 'UI/Inputs/Select';

const SelectWidget: React.FC<WidgetProps> = ({
  id,
  options,
  value,
  onChange,
}) => {
  const handleChange = (option: EnumOptionsType) => {
    onChange(option.value);
  };

  const enumOptions =
    options.enumOptions?.map((option) => ({
      label: option.label,
      value: option.value,
    })) || [];

  const selectedOption = enumOptions.find((option) => option.value === value);

  return (
    <Select
      id={id}
      value={selectedOption}
      onChange={(e) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        handleChange(e.option);
      }}
      options={enumOptions}
    />
  );
};

export default SelectWidget;
