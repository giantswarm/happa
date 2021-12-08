import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import Select from '..';

export const Info: Story<ComponentPropsWithoutRef<typeof Select>> = (args) => {
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

Info.args = {
  id: 'pet',
  info: 'Some info on this input',
  options: ['A dog', 'A cat', 'A frog'],
  placeholder: 'Just select something...',
};

Info.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
