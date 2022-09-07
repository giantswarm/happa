import { Story } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import ViewAndEditName from '..';

export const Simple: Story<ComponentPropsWithoutRef<typeof ViewAndEditName>> = (
  args
) => {
  return <ViewAndEditName {...args} />;
};

Simple.args = {
  value: 'Please add description',
  typeLabel: '',
};
