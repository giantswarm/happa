import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import DateInput from '..';

export const Help: StoryFn<ComponentPropsWithoutRef<typeof DateInput>> = (
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

Help.args = {
  format: 'yyyy-mm-dd',
  label: 'Date of birth',
  help: 'A helpful message',
  id: 'dob',
};

Help.argTypes = {
  format: { control: { type: 'text' } },
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
