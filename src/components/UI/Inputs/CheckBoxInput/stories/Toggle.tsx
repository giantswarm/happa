import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useEffect, useState } from 'react';

import CheckBoxInput from '..';

export const Toggle: StoryFn<ComponentPropsWithoutRef<typeof CheckBoxInput>> = (
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

Toggle.args = {
  checked: false,

  label: 'Hi friends',
  fieldLabel: 'A checkbox',
  info: 'Some info',
  help: 'A helpful message',
  toggle: true,
};

Toggle.argTypes = {
  label: { control: { type: 'text' } },
  fieldLabel: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
