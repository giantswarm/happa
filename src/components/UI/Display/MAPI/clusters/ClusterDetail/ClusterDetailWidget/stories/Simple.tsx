import { Story } from '@storybook/react';
import { Box, Heading, Text } from 'grommet';
import React, { ComponentPropsWithoutRef } from 'react';

import ClusterDetailWidget from '..';

export const Simple: Story<
  ComponentPropsWithoutRef<typeof ClusterDetailWidget>
> = (args) => {
  return (
    <ClusterDetailWidget {...args}>
      <Text>Hi everyone. This is a widget that you can customize</Text>
      <Box direction='row' pad='small' gap='small' margin={{ top: 'medium' }}>
        <Box align='center'>
          <Heading level={3} margin='none'>
            50
          </Heading>
          <Text>shades of happa</Text>
        </Box>
        <Box align='center'>
          <Heading level={3} margin='none'>
            50
          </Heading>
          <Text>shades of happa</Text>
        </Box>
        <Box align='center'>
          <Heading level={3} margin='none'>
            50
          </Heading>
          <Text>shades of happa</Text>
        </Box>
      </Box>
    </ClusterDetailWidget>
  );
};

Simple.args = {
  title: 'Some widget',
};

Simple.argTypes = {
  title: { control: { type: 'text' } },
};
