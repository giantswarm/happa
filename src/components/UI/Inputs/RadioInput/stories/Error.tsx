import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import RadioInput from '..';

export const Error: StoryFn<ComponentPropsWithoutRef<typeof RadioInput>> = (
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

Error.args = {
  name: 'some-input',
  label: 'Hi friends',
  error: 'Oh no',
};

Error.argTypes = {
  label: { control: { type: 'text' } },
  fieldLabel: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
