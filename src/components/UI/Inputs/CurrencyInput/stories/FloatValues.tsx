import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import CurrencyInput from '..';

export const FloatValues: StoryFn<
  ComponentPropsWithoutRef<typeof CurrencyInput>
> = (args) => {
  const [value, setValue] = useState(args.value);

  return <CurrencyInput {...args} value={value} onChange={setValue} />;
};

FloatValues.args = {
  value: 13.5000000004,
  precision: 5,
};

FloatValues.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
