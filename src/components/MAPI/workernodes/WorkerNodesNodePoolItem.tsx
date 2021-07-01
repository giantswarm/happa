import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { relativeDate } from 'lib/helpers';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { extractErrorMessage } from 'MAPI/organizations/utils';
import { NodePool, ProviderNodePool } from 'MAPI/types';
import {
  getNodePoolAvailabilityZones,
  getNodePoolDescription,
  getNodePoolScaling,
  getProviderNodePoolMachineType,
} from 'MAPI/utils';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import PropTypes from 'prop-types';
import React, { useMemo, useRef, useState } from 'react';
import Copyable from 'shared/Copyable';
import styled from 'styled-components';
import { Code } from 'styles';
import AvailabilityZonesLabels from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabels';
import ClusterDetailWidgetOptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidgetOptionalValue';
import { NodePoolGridRow } from 'UI/Display/MAPI/workernodes/styles';
import WorkerNodesNodePoolActions from 'UI/Display/MAPI/workernodes/WorkerNodesNodePoolActions';
import ViewAndEditName from 'UI/Inputs/ViewEditName';

import { IWorkerNodesAdditionalColumn } from './types';
import { deleteNodePool, updateNodePoolDescription } from './utils';
import WorkerNodesNodePoolItemDelete from './WorkerNodesNodePoolItemDelete';
import WorkerNodesNodePoolItemScale from './WorkerNodesNodePoolItemScale';

function formatMachineTypeLabel(providerNodePool?: ProviderNodePool) {
  switch (providerNodePool?.kind) {
    case capzexpv1alpha3.AzureMachinePool:
      return 'Node pool VM size';
    default:
      return undefined;
  }
}

const Row = styled(Box)<{ additionalColumnsCount?: number }>`
  ${({ additionalColumnsCount }) => NodePoolGridRow(additionalColumnsCount)}
`;

const StyledViewAndEditName = styled(ViewAndEditName)`
  max-width: ${({ theme }) => theme.global.size.medium};

  input {
    font-size: 100%;
    padding: ${({ theme }) => theme.global.edgeSize.xsmall};
  }

  .btn-group {
    top: 0;
    display: flex;
  }
`;

const StyledDescriptionWrapper = styled(Box)<{ full?: boolean }>`
  ${({ full }) => (full ? 'grid-column: 2 / fit-content' : undefined)}
`;

interface IWorkerNodesNodePoolItemProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  nodePool?: NodePool;
  providerNodePool?: ProviderNodePool;
  additionalColumns?: IWorkerNodesAdditionalColumn[];
}

const WorkerNodesNodePoolItem: React.FC<IWorkerNodesNodePoolItemProps> = ({
  nodePool,
  providerNodePool,
  additionalColumns,
  ...props
}) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const description = nodePool ? getNodePoolDescription(nodePool) : undefined;
  const availabilityZones = nodePool
    ? getNodePoolAvailabilityZones(nodePool)
    : undefined;
  const machineType = providerNodePool
    ? getProviderNodePoolMachineType(providerNodePool)
    : undefined;
  const scaling = useMemo(() => {
    if (!nodePool) return undefined;

    return getNodePoolScaling(nodePool);
  }, [nodePool]);

  const isScalingInProgress = scaling && scaling.desired !== scaling.current;

  const viewAndEditNameRef = useRef<
    { activateEditMode: () => boolean } & HTMLElement
  >(null);

  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const onStartEditingDescription = () => {
    viewAndEditNameRef.current?.activateEditMode();
  };

  const updateDescription = async (newValue: string) => {
    if (!nodePool) return;

    try {
      await updateNodePoolDescription(
        clientFactory(),
        auth,
        nodePool,
        newValue
      );

      new FlashMessage(
        `Successfully updated the node pool's description`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        `There was a problem updating the node pool's description`,
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err);
    }
  };

  const isDeleting =
    typeof nodePool?.metadata.deletionTimestamp !== 'undefined';

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const onDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const onCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (!nodePool) return;

    setIsDeleteLoading(true);

    try {
      await deleteNodePool(clientFactory(), auth, nodePool);

      setIsDeleteConfirmOpen(false);
      setTimeout(() => {
        setIsDeleteLoading(false);
        // eslint-disable-next-line no-magic-numbers
      }, 200);

      new FlashMessage(
        `Node pool <code>${nodePool.metadata.name}</code> deleted successfully`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      setIsDeleteLoading(false);

      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        `Could not delete node pool <code>${nodePool.metadata.name}</code>`,
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err);
    }
  };

  const [isScaleConfirmOpen, setIsScaleConfirmOpen] = useState(false);

  const onScale = () => {
    setIsScaleConfirmOpen(true);
  };

  const onCancelScale = () => {
    setIsScaleConfirmOpen(false);
  };

  return (
    <Box {...props}>
      <Row
        background={isDeleting ? 'background-back' : 'background-front'}
        round='xsmall'
        additionalColumnsCount={additionalColumns?.length}
      >
        <Box align='center'>
          <ClusterDetailWidgetOptionalValue
            value={nodePool?.metadata.name}
            loaderWidth={70}
            loaderHeight={26}
          >
            {(value) => (
              <Copyable copyText={value as string}>
                <Text aria-label='Node pool name'>
                  <Code>{value}</Code>
                </Text>
              </Copyable>
            )}
          </ClusterDetailWidgetOptionalValue>
        </Box>
        <StyledDescriptionWrapper full={isDeleting}>
          <ClusterDetailWidgetOptionalValue
            value={description}
            loaderWidth={150}
          >
            {(value) =>
              isDeleting ? (
                <Box direction='row' gap='medium' align='baseline'>
                  <Text>{value}</Text>
                  <Text size='small' color='text-xweak'>
                    Deleted {relativeDate(nodePool!.metadata.deletionTimestamp)}
                  </Text>
                </Box>
              ) : (
                <StyledViewAndEditName
                  value={value as string}
                  typeLabel='node pool'
                  onToggleEditingState={setIsEditingDescription}
                  aria-label='Node pool description'
                  onSave={updateDescription}
                  ref={viewAndEditNameRef}
                />
              )
            }
          </ClusterDetailWidgetOptionalValue>
        </StyledDescriptionWrapper>
        {!isDeleting && !isEditingDescription && (
          <>
            <Box align='center'>
              <ClusterDetailWidgetOptionalValue
                value={machineType}
                loaderWidth={130}
              >
                {(value) => (
                  <Code aria-label={formatMachineTypeLabel(providerNodePool)}>
                    {value}
                  </Code>
                )}
              </ClusterDetailWidgetOptionalValue>
            </Box>
            <Box align='center'>
              <ClusterDetailWidgetOptionalValue
                value={availabilityZones}
                loaderHeight={26}
              >
                {(value) => (
                  <AvailabilityZonesLabels zones={value} labelsChecked={[]} />
                )}
              </ClusterDetailWidgetOptionalValue>
            </Box>
            <Box align='center'>
              <ClusterDetailWidgetOptionalValue
                value={scaling?.min}
                loaderWidth={30}
              >
                {(value) => (
                  <Box pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}>
                    <Text aria-label='Node pool autoscaler minimum node count'>
                      {value}
                    </Text>
                  </Box>
                )}
              </ClusterDetailWidgetOptionalValue>
            </Box>
            <Box align='center'>
              <ClusterDetailWidgetOptionalValue
                value={scaling?.max}
                loaderWidth={30}
              >
                {(value) => (
                  <Box pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}>
                    <Text aria-label='Node pool autoscaler maximum node count'>
                      {value}
                    </Text>
                  </Box>
                )}
              </ClusterDetailWidgetOptionalValue>
            </Box>
            <Box align='center'>
              <ClusterDetailWidgetOptionalValue
                value={scaling?.desired}
                loaderWidth={30}
              >
                {(value) => (
                  <Box pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}>
                    <Text aria-label='Node pool autoscaler target node count'>
                      {value}
                    </Text>
                  </Box>
                )}
              </ClusterDetailWidgetOptionalValue>
            </Box>
            <Box align='center'>
              <ClusterDetailWidgetOptionalValue
                value={scaling?.current}
                loaderWidth={30}
              >
                {(value) => (
                  <Box
                    pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}
                    round='xsmall'
                    background={
                      isScalingInProgress ? 'status-warning' : undefined
                    }
                  >
                    <Text
                      aria-label='Node pool autoscaler current node count'
                      color={isScalingInProgress ? 'background' : undefined}
                    >
                      {value}
                    </Text>
                  </Box>
                )}
              </ClusterDetailWidgetOptionalValue>
            </Box>

            {additionalColumns?.map((column) => (
              <Box key={column.title} align='center'>
                {column.render(nodePool, providerNodePool)}
              </Box>
            ))}

            <Box align='center'>
              <WorkerNodesNodePoolActions
                onRenameClick={onStartEditingDescription}
                onDeleteClick={onDelete}
                onScaleClick={onScale}
              />
            </Box>
          </>
        )}
      </Row>

      {nodePool && (
        <Box margin={{ top: isDeleteConfirmOpen ? 'small' : undefined }}>
          <WorkerNodesNodePoolItemDelete
            nodePoolName={nodePool.metadata.name}
            onConfirm={handleDelete}
            onCancel={onCancelDelete}
            open={isDeleteConfirmOpen}
            isLoading={isDeleteLoading}
          />
        </Box>
      )}

      {nodePool && (
        <Box margin={{ top: isScaleConfirmOpen ? 'small' : undefined }}>
          <WorkerNodesNodePoolItemScale
            nodePool={nodePool}
            onConfirm={onCancelScale}
            onCancel={onCancelScale}
            open={isScaleConfirmOpen}
          />
        </Box>
      )}
    </Box>
  );
};

WorkerNodesNodePoolItem.propTypes = {
  nodePool: PropTypes.object as PropTypes.Validator<NodePool>,
  providerNodePool: PropTypes.object as PropTypes.Validator<ProviderNodePool>,
  additionalColumns: PropTypes.array,
};

export default WorkerNodesNodePoolItem;
