import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import Select from '..';

export const Error: StoryFn<ComponentPropsWithoutRef<typeof Select>> = (
  args
) => {
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

Error.args = {
  id: 'pet',
  error: 'Oh no',
  options: ['A dog', 'A cat', 'A frog'],
  placeholder: 'Just select something...',
};

Error.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
