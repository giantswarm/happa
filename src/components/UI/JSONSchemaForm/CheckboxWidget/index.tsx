import { WidgetProps } from '@rjsf/utils';
import React from 'react';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';

const CheckboxWidget: React.FC<WidgetProps> = ({ label, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return <CheckBoxInput label={label} onChange={handleChange} />;
};

export default CheckboxWidget;
