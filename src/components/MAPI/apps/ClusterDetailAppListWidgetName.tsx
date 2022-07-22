import { Text } from 'grommet';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React from 'react';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

interface IClusterDetailAppListWidgetNameProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
}

const ClusterDetailAppListWidgetName: React.FC<
  React.PropsWithChildren<IClusterDetailAppListWidgetNameProps>
> = ({ app, ...props }) => {
  return (
    <ClusterDetailAppListWidget title='App name' titleColor='text' {...props}>
      <OptionalValue value={app?.spec.name} loaderWidth={100}>
        {(value) => <Text aria-label={`App name: ${value}`}>{value}</Text>}
      </OptionalValue>
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetName;
