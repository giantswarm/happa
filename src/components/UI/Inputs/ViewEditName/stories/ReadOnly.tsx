import { Story } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import ViewAndEditName from '..';

export const ReadOnly: Story<
  ComponentPropsWithoutRef<typeof ViewAndEditName>
> = (args) => {
  return <ViewAndEditName {...args} />;
};

ReadOnly.args = {
  value: 'This text is read-only',
  typeLabel: '',
  readOnly: true,
};
