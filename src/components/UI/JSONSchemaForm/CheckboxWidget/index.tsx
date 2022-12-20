import { WidgetProps } from '@rjsf/utils';
import React from 'react';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';

const CheckboxWidget: React.FC<WidgetProps> = ({
  id,
  label,
  schema,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  const { description } = schema;

  return (
    <CheckBoxInput
      id={id}
      help={description}
      fieldLabel={label}
      onChange={handleChange}
    />
  );
};

export default CheckboxWidget;
