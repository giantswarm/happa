import { Meta, Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef } from 'react';

import InstalledApp from '../InstalledApp';

const Template: Story<ComponentPropsWithoutRef<typeof InstalledApp>> = (
  args
) => <InstalledApp {...args} />;

export const Simple = Template.bind({});
Simple.args = {
  name: 'here-goes-the-app-name',
  version: 'v4.3.2',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  name: 'here-goes-the-app-name',
  version: 'v4.3.2',
  logoUrl: 'https://s.giantswarm.io/app-icons/1/png/app-mesh-app-light.png',
};

export const WithoutVersion = Template.bind({});
WithoutVersion.args = {
  name: 'app-without-version',
  logoUrl: 'https://s.giantswarm.io/app-icons/1/png/app-mesh-app-light.png',
  version: '',
};

export const WithDeletionTimestamp = Template.bind({});
WithDeletionTimestamp.args = {
  name: 'app-with-deletion-timestamp',
  logoUrl: 'https://s.giantswarm.io/app-icons/1/png/app-mesh-app-light.png',
  version: 'v14.0.1',
  deletionTimestamp: '2020-08-08',
};

export default {
  title: 'Display/Apps/InstalledApp',
  component: InstalledApp,
} as Meta;
