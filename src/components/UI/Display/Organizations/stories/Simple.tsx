import { Story } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import OrganizationListPage from '../OrganizationListPage';

export const Simple: Story<
  ComponentPropsWithoutRef<typeof OrganizationListPage>
> = (args) => {
  return <OrganizationListPage {...args} />;
};

Simple.args = {
  organizations: [
    {
      name: 'acme',
      clusterCount: 6,
    },
    { name: 'security', clusterCount: 0 },
  ],
  onClickRow: () => {},
  onCreateOrg: () =>
    new Promise((resolve) => {
      resolve();
    }),
};

Simple.argTypes = {};
