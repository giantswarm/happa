import { Box } from 'grommet';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import PropTypes from 'prop-types';
import * as React from 'react';
import UIClusterListItem from 'UI/Display/MAPI/clusters/ClusterListItem';

interface IClusterListItemProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  cluster: capiv1alpha3.ICluster;
}

const ClusterListItem: React.FC<IClusterListItemProps> = ({
  cluster,
  ...props
}) => {
  const description = capiv1alpha3.getClusterDescription(cluster);
  const releaseVersion = capiv1alpha3.getReleaseVersion(cluster);

  return (
    <UIClusterListItem
      name={cluster.metadata.name}
      namespace={cluster.metadata.namespace!}
      description={description}
      creationDate={cluster.metadata.creationTimestamp ?? ''}
      deletionDate={cluster.metadata.deletionTimestamp ?? null}
      releaseVersion={releaseVersion ?? ''}
      k8sVersion='1.20.0'
      workerNodePoolsCount={2}
      workerNodesCount={3}
      workerNodesCPU={34}
      workerNodesMemory={51.634012}
      {...props}
    />
  );
};

ClusterListItem.propTypes = {
  // @ts-expect-error
  cluster: PropTypes.object.isRequired,
};

export default ClusterListItem;
