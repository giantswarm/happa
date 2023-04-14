import { Meta, StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import ClusterEmptyState from '..';

const Template: StoryFn<ComponentPropsWithoutRef<typeof ClusterEmptyState>> = (
  args
) => <ClusterEmptyState {...args} />;

export const NoOrganizations = Template.bind({});

export const ErrorLoadingClusters = Template.bind({});
ErrorLoadingClusters.args = {
  errorLoadingClusters: true,
  selectedOrganization: 'organization',
};

export const NoClusters = Template.bind({});
NoClusters.args = {
  errorLoadingClusters: false,
  selectedOrganization: 'organization',
};

export default {
  title: 'Display/Clusters/ClusterEmptyState',
  component: ClusterEmptyState,
} as Meta;
