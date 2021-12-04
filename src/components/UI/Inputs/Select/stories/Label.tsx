import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import Select from '..';

export const Label: Story<ComponentPropsWithoutRef<typeof Select>> = (args) => {
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

Label.args = {
  id: 'pet',
  label: 'Which pet to get?',
  options: ['A dog', 'A cat', 'A frog'],
  placeholder: 'Just select something...',
};

Label.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
