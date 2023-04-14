import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import TextInput from '..';

export const Info: StoryFn<ComponentPropsWithoutRef<typeof TextInput>> = (
  args
) => {
  const [value, setValue] = useState(args.value);

  return (
    <TextInput
      {...args}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

Info.args = {
  value: 'Hi people',
  label: 'Some input',
  info: 'You can set a cool value',
};

Info.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
