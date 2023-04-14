import { StoryFn } from '@storybook/react';
import format from 'date-fns/fp/format';
import parseISO from 'date-fns/fp/parseISO';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import DateInput from '..';

export const Button: StoryFn<ComponentPropsWithoutRef<typeof DateInput>> = (
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
      buttonProps={{
        label: value
          ? format('d MMM yyyy')(parseISO(value))
          : 'Pick a date and call me Jim',
      }}
    />
  );
};

Button.args = {
  id: 'dob',
};

Button.argTypes = {
  format: { control: { type: 'text' } },
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
