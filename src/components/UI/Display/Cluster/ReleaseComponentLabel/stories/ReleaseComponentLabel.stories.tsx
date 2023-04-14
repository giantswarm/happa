import { Meta, StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import ReleaseComponentLabel from '..';

const Template: StoryFn<
  ComponentPropsWithoutRef<typeof ReleaseComponentLabel>
> = (args) => <ReleaseComponentLabel name={args.name} {...args} />;

export const Added = Template.bind({});
Added.args = {
  name: 'new-component',
  version: '1.2.3',
  isAdded: true,
};

export const Changed = Template.bind({});
Changed.args = {
  name: 'calico',
  version: '3.1.5',
  oldVersion: '3.1.4',
};

export const Removed = Template.bind({});
Removed.args = {
  name: 'removed-component',
  isRemoved: true,
};

export default {
  title: 'Display/Releases/ReleaseComponentLabel',
  component: ReleaseComponentLabel,
} as Meta;
