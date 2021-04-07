import { Meta, Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef } from 'react';

import ClusterIDLabel from '..';

const Template: Story<ComponentPropsWithoutRef<typeof ClusterIDLabel>> = (
  args
) => (
  <ClusterIDLabel clusterID={args.clusterID} copyEnabled={args.copyEnabled} />
);

export const Normal = Template.bind({});
Normal.args = {
  clusterID: 'a1b2g',
};

export const Truncated = Template.bind({});
Truncated.args = {
  clusterID: 'this-is-a-long-cluster-id',
};

export const CopyEnabled = Template.bind({});
CopyEnabled.args = {
  clusterID: 'i3b2g',
  copyEnabled: true,
};

export const CopyEnabledTruncated = Template.bind({});
CopyEnabledTruncated.args = {
  clusterID: 'another-long-cluster-id',
  copyEnabled: true,
};

export default {
  title: 'Display/Clusters/ClusterIDLabel',
  component: ClusterIDLabel,
} as Meta;
