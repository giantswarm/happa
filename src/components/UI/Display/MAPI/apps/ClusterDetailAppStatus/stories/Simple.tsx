import { Story } from '@storybook/react';
import { Box } from 'grommet';
import React, { ComponentPropsWithoutRef } from 'react';

import ClusterDetailAppStatus from '..';

export const Simple: Story<
  ComponentPropsWithoutRef<typeof ClusterDetailAppStatus>
> = (args) => {
  return (
    <Box gap='medium' align='flex-start'>
      <ClusterDetailAppStatus {...args} />
    </Box>
  );
};

Simple.args = {
  status: 'some-status',
};

Simple.argTypes = {
  status: { control: { type: 'text' } },
};
