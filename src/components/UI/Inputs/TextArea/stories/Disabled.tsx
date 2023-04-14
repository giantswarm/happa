import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import TextArea from '..';

export const Disabled: StoryFn<ComponentPropsWithoutRef<typeof TextArea>> = (
  args
) => {
  const [value, setValue] = useState(args.value);

  return (
    <TextArea
      {...args}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

Disabled.args = {
  value: 'The quick brown fox jumps over the lazy dog',
  disabled: true,
};

Disabled.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
