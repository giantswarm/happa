import { Meta, StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import NotAvailable from '..';

const Template: StoryFn<ComponentPropsWithoutRef<typeof NotAvailable>> = (
  args
) => <NotAvailable {...args} />;

export const Simple = Template.bind({});
Simple.args = {};

export default {
  title: 'Display/NotAvailable',
  component: NotAvailable,
} as Meta;
