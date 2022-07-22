import { Text } from 'grommet';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React from 'react';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

interface IClusterDetailAppListWidgetInstalledAsProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
}

const ClusterDetailAppListWidgetInstalledAs: React.FC<
  React.PropsWithChildren<IClusterDetailAppListWidgetInstalledAsProps>
> = ({ app, ...props }) => {
  return (
    <ClusterDetailAppListWidget
      title='Installed as'
      titleColor='text'
      {...props}
    >
      <OptionalValue value={app?.metadata.name} loaderWidth={100}>
        {(value) => (
          <Text aria-label={`App installed as: ${value}`}>{value}</Text>
        )}
      </OptionalValue>
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetInstalledAs;
