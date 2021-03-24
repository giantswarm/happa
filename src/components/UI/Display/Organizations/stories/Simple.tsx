import { Story } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import OrganizationListPage from '../OrganizationListPage';

export const Simple: Story<
  ComponentPropsWithoutRef<typeof OrganizationListPage>
> = (args) => {
  return <OrganizationListPage {...args} />;
};

Simple.args = {
  onClickRow: () => {},
  data: [
    {
      name: 'acme',
      clusters: 6,
      oldest_release: 'v11.5.6',
      newest_release: 'v14.1.0',
      oldest_k8s_version: 'v1.15',
      newest_k8s_version: 'v1.19',
      apps: 3,
      app_deployments: 18,
    },
    { name: 'security', clusters: 0 },
  ],
  createOrg: () =>
    new Promise((resolve) => {
      resolve();
    }),
};

Simple.argTypes = {};
