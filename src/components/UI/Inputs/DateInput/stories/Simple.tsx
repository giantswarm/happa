import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import DateInput from '..';

export const Simple: Story<ComponentPropsWithoutRef<typeof DateInput>> = (
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

Simple.args = {
  format: 'yyyy-mm-dd',
};

Simple.argTypes = {
  format: { control: { type: 'text' } },
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
