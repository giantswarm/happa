import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import ClusterLabels from 'Cluster/ClusterDetail/ClusterLabels/ClusterLabels';
import { extractErrorMessage } from 'MAPI/utils';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import React, { useMemo, useState } from 'react';
import { mutate } from 'swr';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { updateClusterLabels } from './utils';

interface IClusterDetailWidgetLabelsProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1beta1.ICluster;
  canUpdateCluster?: boolean;
}

const ClusterDetailWidgetLabels: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetLabelsProps>
> = ({ cluster, canUpdateCluster, ...props }) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const labels = useMemo(() => {
    if (typeof cluster === 'undefined') {
      return undefined;
    }

    return capiv1beta1.getClusterLabels(cluster);
  }, [cluster]);

  const [labelsError, setLabelsError] = useState('');
  const [labelsIsLoading, setLabelsIsLoading] = useState(false);

  const handleLabelsChange = async (patch: ILabelChange) => {
    if (!cluster) return;

    setLabelsError('');
    setLabelsIsLoading(true);

    try {
      const updatedCluster = await updateClusterLabels(
        clientFactory(),
        auth,
        cluster.metadata.namespace!,
        cluster.metadata.name,
        patch
      );

      mutate(
        capiv1beta1.getClusterKey(
          cluster.metadata.namespace!,
          cluster.metadata.name
        ),
        updatedCluster
      );
      mutate(
        capiv1beta1.getClusterListKey({
          namespace: cluster.metadata.namespace!,
        })
      );

      new FlashMessage(
        `Successfully updated the cluster's labels`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        `There was a problem updating the cluster's labels`,
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      setLabelsError(errorMessage);

      ErrorReporter.getInstance().notify(err as Error);
    } finally {
      setLabelsIsLoading(false);
    }
  };

  return (
    <ClusterDetailWidget title='Labels' inline={true} {...props}>
      <OptionalValue
        value={labels}
        loaderHeight={34}
        loaderWidth={350}
        flashOnValueChange={false}
      >
        {(value) => (
          <ClusterLabels
            labels={value}
            onChange={handleLabelsChange}
            errorMessage={labelsError}
            isLoading={labelsIsLoading}
            showTitle={false}
            unauthorized={!canUpdateCluster}
          />
        )}
      </OptionalValue>
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetLabels;
