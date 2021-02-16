import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import RadioInput from '..';

export const FieldLabel: Story<ComponentPropsWithoutRef<typeof RadioInput>> = (
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

FieldLabel.args = {
  name: 'some-input',
  label: 'Hi friends',
  fieldLabel: 'A radio input',
};

FieldLabel.argTypes = {
  label: { control: { type: 'text' } },
  fieldLabel: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
