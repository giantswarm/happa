import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import RadioInput from '..';

export const Help: StoryFn<ComponentPropsWithoutRef<typeof RadioInput>> = (
  args
) => {
  const [value, setValue] = useState('');

  return (
    <RadioInput
      {...args}
      checked={value === 'hello'}
      value='hello'
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

Help.args = {
  name: 'some-input',
  label: 'Hi friends',
  help: 'A helpful message',
};

Help.argTypes = {
  label: { control: { type: 'text' } },
  fieldLabel: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
