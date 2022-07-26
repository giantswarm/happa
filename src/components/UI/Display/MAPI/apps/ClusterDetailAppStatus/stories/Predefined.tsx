import { Story } from '@storybook/react';
import { Box } from 'grommet';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { ComponentPropsWithoutRef } from 'react';

import ClusterDetailAppStatus from '..';

export const Predefined: Story<
  ComponentPropsWithoutRef<typeof ClusterDetailAppStatus>
> = () => {
  return (
    <Box gap='medium' align='flex-start'>
      <ClusterDetailAppStatus status={applicationv1alpha1.statusUnknown} />
      <ClusterDetailAppStatus status={applicationv1alpha1.statusDeployed} />
      <ClusterDetailAppStatus status={applicationv1alpha1.statusUninstalled} />
      <ClusterDetailAppStatus status={applicationv1alpha1.statusSuperseded} />
      <ClusterDetailAppStatus status={applicationv1alpha1.statusFailed} />
      <ClusterDetailAppStatus status={applicationv1alpha1.statusUninstalling} />
      <ClusterDetailAppStatus
        status={applicationv1alpha1.statusPendingInstall}
      />
      <ClusterDetailAppStatus
        status={applicationv1alpha1.statusPendingUpgrade}
      />
      <ClusterDetailAppStatus
        status={applicationv1alpha1.statusPendingRollback}
      />
    </Box>
  );
};
