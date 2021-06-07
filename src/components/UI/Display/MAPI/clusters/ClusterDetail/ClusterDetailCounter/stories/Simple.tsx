import { Story } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import ClusterDetailCounter from '..';

export const Simple: Story<
  ComponentPropsWithoutRef<typeof ClusterDetailCounter>
> = (args) => {
  return <ClusterDetailCounter {...args} />;
};

Simple.args = {
  label: 'dog',
  value: 1,
};

Simple.argTypes = {
  label: { control: { type: 'text' } },
  value: { control: { type: 'number' } },
};
