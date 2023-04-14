import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import RadioInput from '..';

export const Multiple: StoryFn<
  ComponentPropsWithoutRef<typeof RadioInput>
> = () => {
  const [value, setValue] = useState('');

  return (
    <>
      <RadioInput
        name='some-input'
        label='Hey friends'
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

Multiple.args = {};

Multiple.argTypes = {
  label: { control: { type: 'text' } },
  fieldLabel: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
