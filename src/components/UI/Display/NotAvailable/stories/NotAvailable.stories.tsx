import { Meta, Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef } from 'react';

import NotAvailable from '..';

const Template: Story<ComponentPropsWithoutRef<typeof NotAvailable>> = (
  args
) => <NotAvailable {...args} />;

export const Simple = Template.bind({});
Simple.args = {};

export default {
  title: 'Display/NotAvailable',
  component: NotAvailable,
} as Meta;
