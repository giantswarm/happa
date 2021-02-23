import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import DateInput from '..';

export const Label: Story<ComponentPropsWithoutRef<typeof DateInput>> = (
  args
) => {
  const [value, setValue] = useState('');

  return (
    <DateInput
      {...args}
      value={value}
      onChange={(e) => {
        setValue(e.value as string);
      }}
    />
  );
};

Label.args = {
  format: 'yyyy-mm-dd',
  label: 'Date of birth',
  id: 'dob',
};

Label.argTypes = {
  format: { control: { type: 'text' } },
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
