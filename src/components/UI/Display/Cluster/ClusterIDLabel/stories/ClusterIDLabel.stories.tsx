import { Meta, Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef } from 'react';

import ClusterIDLabel, { ClusterIDLabelType } from '..';

const Template: Story<ComponentPropsWithoutRef<typeof ClusterIDLabel>> = (
  args
) => (
  <ClusterIDLabel
    clusterID={args.clusterID}
    copyEnabled={args.copyEnabled}
    variant={args.variant}
  />
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

export const NameVariant = Template.bind({});
NameVariant.args = {
  clusterID: 'rh62p',
  variant: ClusterIDLabelType.Name,
};

export const NameVariantCopyEnabled = Template.bind({});
NameVariantCopyEnabled.args = {
  clusterID: 'rh62p',
  copyEnabled: true,
  variant: ClusterIDLabelType.Name,
};

export default {
  title: 'Display/Clusters/ClusterIDLabel',
  component: ClusterIDLabel,
} as Meta;
