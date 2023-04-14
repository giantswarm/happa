import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import CurrencyInput from '..';

export const Currencies: StoryFn<
  ComponentPropsWithoutRef<typeof CurrencyInput>
> = (args) => {
  const [value, setValue] = useState(args.value);

  return <CurrencyInput {...args} value={value} onChange={setValue} />;
};

Currencies.args = {
  value: 1,
  currencyLabel: '€',
};

Currencies.argTypes = {
  currencyLabel: { control: { type: 'select', options: ['€', '$', '£'] } },
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
