import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React from 'react';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import ClusterDetailAppStatus from 'UI/Display/MAPI/apps/ClusterDetailAppStatus';
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
  const status = app ? applicationv1alpha1.getAppStatus(app) : undefined;

  return (
    <ClusterDetailAppListWidget title='Status' titleColor='text' {...props}>
      <OptionalValue value={status} loaderWidth={100}>
        {(value) => <ClusterDetailAppStatus status={value} />}
      </OptionalValue>
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetStatus;
