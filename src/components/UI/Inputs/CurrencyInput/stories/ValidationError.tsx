import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import CurrencyInput from '..';

export const ValidationError: StoryFn<
  ComponentPropsWithoutRef<typeof CurrencyInput>
> = (args) => {
  const [value, setValue] = useState(args.value);

  return <CurrencyInput {...args} value={value} onChange={setValue} />;
};

ValidationError.args = {
  value: 1,
  error: 'Naah. Wrong value',
};

ValidationError.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
