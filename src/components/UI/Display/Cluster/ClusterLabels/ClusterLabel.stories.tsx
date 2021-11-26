import { Meta, Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef } from 'react';

import ClusterLabel from './ClusterLabel';

export const Simple: Story<ComponentPropsWithoutRef<typeof ClusterLabel>> = (
  args
) => <ClusterLabel {...args} />;

Simple.args = {
  label: 'something.io/cluster-label',
  value: 'some-cluster-value',
};

export default {
  title: 'Display/Clusters/ClusterLabel',
  component: ClusterLabel,
} as Meta;
