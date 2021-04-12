import { Meta, Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef } from 'react';

import InstalledApp from '../InstalledApp';

const Template: Story<ComponentPropsWithoutRef<typeof InstalledApp>> = (
  args
) => <InstalledApp {...args} />;

export const Simple = Template.bind({});
Simple.args = {
  app: {
    metadata: { name: 'here-goes-the-app-name' },
    spec: { version: 'v4.3.2' },
  },
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  app: {
    logoUrl: 'https://s.giantswarm.io/app-icons/1/png/app-mesh-app-light.png',
    metadata: { name: 'here-goes-the-app-name' },
    spec: { version: 'v4.3.2' },
  },
};

export const WithoutVersion = Template.bind({});
WithoutVersion.args = {
  app: {
    metadata: { name: 'app-without-version' },
    spec: {},
  },
};

export default {
  title: 'Display/Apps/InstalledApp',
  component: InstalledApp,
} as Meta;
