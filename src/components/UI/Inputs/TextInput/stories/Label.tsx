import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import TextInput from '..';

export const Label: Story<ComponentPropsWithoutRef<typeof TextInput>> = (
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

Label.args = {
  value: 'Hi people',
  label: 'Some input',
};

Label.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
