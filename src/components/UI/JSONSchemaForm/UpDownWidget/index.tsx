import { WidgetProps } from '@rjsf/utils';
import React from 'react';
import NumberPicker from 'UI/Inputs/NumberPicker';

const UpDownWidget: React.FC<WidgetProps> = ({ onChange }) => {
  const handleChange = ({
    value,
    valid,
  }: {
    value: number;
    valid: boolean;
  }) => {
    if (valid) {
      onChange(value);
    }
  };

  return <NumberPicker onChange={handleChange} />;
};

export default UpDownWidget;
