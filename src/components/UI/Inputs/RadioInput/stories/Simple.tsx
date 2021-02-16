import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import RadioInput from '../index';

export const Simple: Story<ComponentPropsWithoutRef<typeof RadioInput>> = (
  args
) => {
  const [value, setValue] = useState('');

  return (
    <>
      <RadioInput
        {...args}
        checked={value === 'hello'}
        value='hello'
        onChange={(e) => setValue(e.target.value)}
      />
      <RadioInput
        name='some-input'
        label='Bye enemies'
        checked={value === 'bye'}
        value='bye'
        onChange={(e) => setValue(e.target.value)}
      />
    </>
  );
};

Simple.args = {
  checked: false,

  name: 'some-input',
  label: 'Hi friends',
  fieldLabel: 'A radio input',
  help: 'A helpful message',
};

Simple.argTypes = {
  label: { control: { type: 'text' } },
  fieldLabel: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
