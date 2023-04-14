import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import CurrencyInput from '..';

export const Constraints: StoryFn<
  ComponentPropsWithoutRef<typeof CurrencyInput>
> = (args) => {
  const [value, setValue] = useState(args.value);

  return <CurrencyInput {...args} value={value} onChange={setValue} />;
};

Constraints.args = {
  value: 1,
  max: 10,
  min: 2,
};

Constraints.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
