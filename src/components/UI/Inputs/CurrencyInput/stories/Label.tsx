import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import CurrencyInput from '..';

export const Label: Story<ComponentPropsWithoutRef<typeof CurrencyInput>> = (
  args
) => {
  const [value, setValue] = useState(args.value);

  return <CurrencyInput {...args} value={value} onChange={setValue} />;
};

Label.args = {
  value: 1,
  label: 'Rent price',
};

Label.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
