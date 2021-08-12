import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import ExpiryHoursPicker, {
  IExpiryHoursPickerProps,
} from './ExpiryHoursPicker';

export default {
  title: 'Inputs/ExpiryHoursPicker',
  component: ExpiryHoursPicker,
} as Meta;

const Template: Story<IExpiryHoursPickerProps> = (args) => (
  <ExpiryHoursPicker {...args} />
);

export const Standard = Template.bind({});

Standard.args = {
  onChange: (ttl) => {
    // eslint-disable-next-line no-console
    console.log('onChange for ExpiryHoursPicker called with:', ttl);
  },
  initialValue: 0,
  maxSafeValueHours: 10,
};
