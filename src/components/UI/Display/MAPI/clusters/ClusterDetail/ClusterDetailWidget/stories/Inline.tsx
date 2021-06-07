import { Story } from '@storybook/react';
import { Text } from 'grommet';
import React, { ComponentPropsWithoutRef } from 'react';

import ClusterDetailWidget from '..';

export const Inline: Story<
  ComponentPropsWithoutRef<typeof ClusterDetailWidget>
> = (args) => {
  return (
    <ClusterDetailWidget
      {...args}
      contentProps={{
        direction: 'row',
        gap: 'xsmall',
        wrap: true,
      }}
    >
      <Text>Something</Text>
      <Text>Something else</Text>
    </ClusterDetailWidget>
  );
};

Inline.args = {
  title: 'Some widget',
  inline: true,
};

Inline.argTypes = {
  title: { control: { type: 'text' } },
  inline: { control: { type: 'boolean' } },
};
