import { Text } from 'grommet';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React from 'react';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

interface IClusterDetailAppListWidgetStatusProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
}

const ClusterDetailAppListWidgetStatus: React.FC<
  React.PropsWithChildren<IClusterDetailAppListWidgetStatusProps>
> = ({ app, ...props }) => {
  let status: string | undefined = '';
  if (!app) status = undefined;
  if (app?.status?.release.status) status = app.status.release.status;

  return (
    <ClusterDetailAppListWidget title='Status' {...props}>
      <OptionalValue value={status} loaderWidth={100}>
        {(value) => <Text aria-label={`App status: ${value}`}>{value}</Text>}
      </OptionalValue>
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetStatus;
