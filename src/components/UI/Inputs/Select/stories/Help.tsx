import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import Select from '..';

export const Help: Story<ComponentPropsWithoutRef<typeof Select>> = (args) => {
  const [value, setValue] = useState(args.value);

  return (
    <Select
      {...args}
      value={value}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      onChange={(e) => setValue(e.target.option)}
    />
  );
};

Help.args = {
  id: 'pet',
  help: 'A helpful message',
  options: ['A dog', 'A cat', 'A frog'],
  placeholder: 'Just select something...',
};

Help.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
