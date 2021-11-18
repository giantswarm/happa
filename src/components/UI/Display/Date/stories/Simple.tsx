import { Story } from '@storybook/react';
import React from 'react';

import Date from '..';

export const Simple: Story<React.ComponentPropsWithoutRef<typeof Date>> = (
  args
) => {
  return (
    <div>
      <Date {...args} />
    </div>
  );
};

Simple.args = {};

Simple.argTypes = {
  value: {
    control: {
      type: 'date',
    },
    defaultValue: '2021-01-10',
    name: 'date (local time zone)',
  },
};
