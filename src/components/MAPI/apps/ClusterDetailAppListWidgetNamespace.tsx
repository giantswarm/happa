import { Text } from 'grommet';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React from 'react';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

interface IClusterDetailAppListWidgetNamespaceProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
}

const ClusterDetailAppListWidgetNamespace: React.FC<IClusterDetailAppListWidgetNamespaceProps> =
  ({ app, ...props }) => {
    return (
      <ClusterDetailAppListWidget title='Target namespace' {...props}>
        <OptionalValue value={app?.spec.namespace} loaderWidth={100}>
          {(value) => (
            <Text aria-label={`App target namespace: ${value}`}>{value}</Text>
          )}
        </OptionalValue>
      </ClusterDetailAppListWidget>
    );
  };

export default ClusterDetailAppListWidgetNamespace;
