import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useEffect, useState } from 'react';

import CheckBoxInput from '..';

export const Simple: StoryFn<ComponentPropsWithoutRef<typeof CheckBoxInput>> = (
  args
) => {
  const [checked, setChecked] = useState(args.checked);

  useEffect(() => {
    setChecked(args.checked);
  }, [args.checked]);

  return (
    <CheckBoxInput
      {...args}
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
};

Simple.args = {
  checked: false,

  label: 'Hi friends',
};

Simple.argTypes = {
  label: { control: { type: 'text' } },
  fieldLabel: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
