import { Story } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import ClusterDetailCounter from '..';

export const PluralizedLabel: Story<
  ComponentPropsWithoutRef<typeof ClusterDetailCounter>
> = (args) => {
  return <ClusterDetailCounter {...args} />;
};

PluralizedLabel.args = {
  label: 'dog',
  value: 35,
  pluralize: true,
};

PluralizedLabel.argTypes = {
  label: { control: { type: 'text' } },
  value: { control: { type: 'number' } },
  pluralize: { control: { type: 'boolean' } },
};
