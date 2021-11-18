import { Story } from '@storybook/react';
import React from 'react';

import Date from '..';

export const Relative: Story<React.ComponentPropsWithoutRef<typeof Date>> = (
  args
) => {
  return (
    <div>
      <Date {...args} />
    </div>
  );
};

Relative.args = {
  relative: true,
};

Relative.argTypes = {
  value: {
    control: {
      type: 'date',
    },
    defaultValue: '2021-01-10',
    name: 'date (local time zone)',
  },
};
