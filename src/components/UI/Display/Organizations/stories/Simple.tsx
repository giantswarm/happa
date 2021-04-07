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
      clusterCount: '6',
      oldestRelease: 'v11.5.6',
      newestRelease: 'v14.1.0',
      oldestK8sVersion: 'v1.15',
      newestK8sVersion: 'v1.19',
      apps: 3,
      appDeployments: 18,
    },
    { name: 'security', clusterCount: '0' },
  ],
  createOrg: () =>
    new Promise((resolve) => {
      resolve();
    }),
};

Simple.argTypes = {};
