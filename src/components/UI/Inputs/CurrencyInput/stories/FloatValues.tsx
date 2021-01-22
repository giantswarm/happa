import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import CurrencyInput from '..';

export const FloatValues: Story<
  ComponentPropsWithoutRef<typeof CurrencyInput>
> = (args) => {
  const [value, setValue] = useState(args.value);

  return <CurrencyInput {...args} value={value} onChange={setValue} />;
};

FloatValues.args = {
  value: 13.5000000004,
  precision: 5,
};
