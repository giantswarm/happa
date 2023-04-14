import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import NumberPicker from '..';

export const Simple: StoryFn<ComponentPropsWithoutRef<typeof NumberPicker>> = (
  args
) => {
  return <NumberPicker {...args} />;
};

Simple.args = {
  value: 3,
  id: 'money',
  label: 'Count your money',
  info: 'Aha! Did not know that',
  help: 'A very helpful message',
};

Simple.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
