import { WidgetProps } from '@rjsf/utils';
import React from 'react';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';

import FieldDescription from '../FieldDescription';
import FieldLabel from '../FieldLabel';

const ToggleWidget: React.FC<WidgetProps> = ({
  id,
  label,
  schema,
  required,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  const labelComponent = (
    <FieldLabel label={label} id={id} required={required} />
  );

  const { description } = schema;
  const descriptionComponent = <FieldDescription description={description} />;

  return (
    <CheckBoxInput
      id={id}
      toggle={true}
      label={labelComponent}
      help={description && descriptionComponent}
      margin={{ vertical: 'small' }}
      contentProps={{ pad: 'none' }}
      onChange={handleChange}
    />
  );
};

export default ToggleWidget;
