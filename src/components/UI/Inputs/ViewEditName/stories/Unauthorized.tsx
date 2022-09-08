import { Story } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import ViewAndEditName from '..';

export const Unauthorized: Story<
  ComponentPropsWithoutRef<typeof ViewAndEditName>
> = (args) => {
  return <ViewAndEditName {...args} />;
};

Unauthorized.args = {
  value: 'Unauthorized to edit this text',
  typeLabel: '',
  unauthorized: true,
};
