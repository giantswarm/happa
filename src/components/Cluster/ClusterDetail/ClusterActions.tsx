import { Box, Heading } from 'grommet';
import { batchedClusterDelete } from 'model/stores/batchActions';
import { CLUSTER_DELETE_REQUEST } from 'model/stores/cluster/constants';
import { selectClusterById } from 'model/stores/cluster/selectors';
import {
  filterUserInstalledApps,
  getNumberOfNodePoolsNodes,
} from 'model/stores/cluster/utils';
import { selectLoadingFlagByIdAndAction } from 'model/stores/entityloading/selectors';
import { selectClusterNodePools } from 'model/stores/nodepool/selectors';
import { IState } from 'model/stores/state';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import ClusterDetailDeleteAction, {
  ClusterDetailDeleteActionNameVariant,
} from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailDeleteAction';

interface IClusterActionsProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const ClusterActions: React.FC<
  React.PropsWithChildren<IClusterActionsProps>
> = (props) => {
  const { clusterId } = useParams<{ clusterId: string; orgId: string }>();

  // The case where the cluster is not found is handled by the parent component.
  const cluster = useSelector(
    (state: IState) => selectClusterById(state, clusterId)!
  );

  const nodePools = useSelector((state: IState) =>
    selectClusterNodePools(state, clusterId)
  );
  const workerNodesCount = getNumberOfNodePoolsNodes(nodePools);

  const hasOptionalIngress = cluster.capabilities?.hasOptionalIngress;
  const userInstalledApps = filterUserInstalledApps(
    cluster.apps ?? [],
    hasOptionalIngress ?? false
  );

  const dispatch = useDispatch();
  const handleDelete = () => {
    dispatch(batchedClusterDelete(cluster));
  };

  const isLoading = useSelector((state: IState) =>
    selectLoadingFlagByIdAndAction(
      state,
      clusterId,
      CLUSTER_DELETE_REQUEST,
      false
    )
  );

  return (
    <Box {...props}>
      <Box direction='row' align='baseline' wrap={true}>
        <Box basis='1/4' width={{ min: '250px' }} flex={{ grow: 1, shrink: 0 }}>
          <Heading level={2} margin='none'>
            Delete cluster
          </Heading>
        </Box>
        <ClusterDetailDeleteAction
          name={cluster.id}
          description={cluster.name!}
          creationDate={cluster.create_date ?? ''}
          workerNodesCount={workerNodesCount}
          nodePoolsCount={nodePools.length}
          userInstalledAppsCount={
            typeof cluster.apps !== 'undefined'
              ? userInstalledApps.length
              : undefined
          }
          onDelete={handleDelete}
          isLoading={isLoading}
          variant={ClusterDetailDeleteActionNameVariant.ID}
          basis='3/4'
          flex={{ grow: 1, shrink: 0 }}
        />
      </Box>
    </Box>
  );
};

export default ClusterActions;
