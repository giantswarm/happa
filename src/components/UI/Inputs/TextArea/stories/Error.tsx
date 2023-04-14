import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import TextArea from '..';

export const Error: StoryFn<ComponentPropsWithoutRef<typeof TextArea>> = (
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

Error.args = {
  value: 'The quick brown fox jumps over the lazy dog',
  error: 'There is something very wrong!',
};

Error.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
