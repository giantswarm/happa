import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { relativeDate } from 'lib/helpers';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { NodePool, ProviderNodePool } from 'MAPI/types';
import {
  extractErrorMessage,
  getNodePoolAvailabilityZones,
  getNodePoolDescription,
  getNodePoolScaling,
} from 'MAPI/utils';
import React, { useMemo, useRef, useState } from 'react';
import Copyable from 'shared/Copyable';
import styled from 'styled-components';
import { Code } from 'styles';
import AvailabilityZonesLabels from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabels';
import { NodePoolGridRow } from 'UI/Display/MAPI/workernodes/styles';
import WorkerNodesNodePoolActions from 'UI/Display/MAPI/workernodes/WorkerNodesNodePoolActions';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import ViewAndEditName, {
  ViewAndEditNameVariant,
} from 'UI/Inputs/ViewEditName';

import { IWorkerNodesAdditionalColumn } from './types';
import { deleteNodePoolResources, updateNodePoolDescription } from './utils';
import WorkerNodesNodePoolItemDelete from './WorkerNodesNodePoolItemDelete';
import WorkerNodesNodePoolItemMachineType from './WorkerNodesNodePoolItemMachineType';
import WorkerNodesNodePoolItemScale from './WorkerNodesNodePoolItemScale';

function formatAvailabilityZonesLabel(zones: string[]) {
  if (zones.length < 1) {
    return 'Availability zones: not available';
  }

  return `Availability zones: ${zones.join(', ')}`;
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
  readOnly?: boolean;
}

const WorkerNodesNodePoolItem: React.FC<IWorkerNodesNodePoolItemProps> = ({
  nodePool,
  providerNodePool,
  additionalColumns,
  readOnly,
  ...props
}) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const description =
    nodePool && providerNodePool
      ? getNodePoolDescription(nodePool, providerNodePool)
      : undefined;
  const availabilityZones =
    nodePool && providerNodePool
      ? getNodePoolAvailabilityZones(nodePool, providerNodePool)
      : undefined;
  const scaling = useMemo(() => {
    if (!nodePool) return undefined;

    return getNodePoolScaling(nodePool, providerNodePool);
  }, [nodePool, providerNodePool]);

  const isScalingInProgress = scaling && scaling.desired !== scaling.current;

  const viewAndEditNameRef = useRef<ViewAndEditName>(null);

  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const updateDescription = async (newValue: string) => {
    if (!nodePool) return;

    try {
      await updateNodePoolDescription(clientFactory, auth, nodePool, newValue);

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

      ErrorReporter.getInstance().notify(err as Error);
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
      await deleteNodePoolResources(clientFactory, auth, nodePool);

      setIsDeleteConfirmOpen(false);
      setTimeout(() => {
        setIsDeleteLoading(false);
        // eslint-disable-next-line no-magic-numbers
      }, 200);

      new FlashMessage(
        (
          <>
            Node pool <code>{nodePool.metadata.name}</code> deleted successfully
          </>
        ),
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      setIsDeleteLoading(false);

      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        (
          <>
            Could not delete node pool <code>{nodePool.metadata.name}</code>
          </>
        ),
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err as Error);
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
          <OptionalValue
            value={nodePool?.metadata.name}
            loaderWidth={70}
            loaderHeight={26}
          >
            {(value) => (
              <Copyable copyText={value as string}>
                <Text aria-label={`Name: ${value}`}>
                  <Code>{value}</Code>
                </Text>
              </Copyable>
            )}
          </OptionalValue>
        </Box>
        <StyledDescriptionWrapper full={isDeleting}>
          <OptionalValue value={description} loaderWidth={150}>
            {(value) =>
              isDeleting ? (
                <Box direction='row' gap='medium' align='baseline'>
                  <Text>{value}</Text>
                  <Text size='small' color='text-xweak'>
                    Deleted {relativeDate(nodePool.metadata.deletionTimestamp)}
                  </Text>
                </Box>
              ) : (
                <StyledViewAndEditName
                  value={value as string}
                  typeLabel='node pool'
                  onToggleEditingState={setIsEditingDescription}
                  aria-label={`Description: ${value}`}
                  onSave={updateDescription}
                  ref={viewAndEditNameRef}
                  variant={ViewAndEditNameVariant.Description}
                  readOnly={readOnly}
                />
              )
            }
          </OptionalValue>
        </StyledDescriptionWrapper>
        {!isDeleting && !isEditingDescription && (
          <>
            <WorkerNodesNodePoolItemMachineType
              nodePool={nodePool}
              providerNodePool={providerNodePool}
            />
            <Box align='center'>
              <OptionalValue value={availabilityZones} loaderHeight={26}>
                {(value) => (
                  <Box
                    direction='row'
                    aria-label={formatAvailabilityZonesLabel(value as string[])}
                  >
                    <AvailabilityZonesLabels zones={value} labelsChecked={[]} />
                  </Box>
                )}
              </OptionalValue>
            </Box>
            <Box align='center'>
              <OptionalValue value={scaling?.min} loaderWidth={30}>
                {(value) => (
                  <Box pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}>
                    <Text
                      aria-label={`Autoscaler minimum node count: ${value}`}
                    >
                      {value}
                    </Text>
                  </Box>
                )}
              </OptionalValue>
            </Box>
            <Box align='center'>
              <OptionalValue value={scaling?.max} loaderWidth={30}>
                {(value) => (
                  <Box pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}>
                    <Text
                      aria-label={`Autoscaler maximum node count: ${value}`}
                    >
                      {value}
                    </Text>
                  </Box>
                )}
              </OptionalValue>
            </Box>
            <Box align='center'>
              <OptionalValue value={scaling?.desired} loaderWidth={30}>
                {(value) => (
                  <Box pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}>
                    <Text aria-label={`Autoscaler target node count: ${value}`}>
                      {value}
                    </Text>
                  </Box>
                )}
              </OptionalValue>
            </Box>
            <Box align='center'>
              <OptionalValue value={scaling?.current} loaderWidth={30}>
                {(value) => (
                  <Box
                    pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}
                    round='xsmall'
                    background={
                      isScalingInProgress ? 'status-warning' : undefined
                    }
                  >
                    <Text
                      aria-label={`Autoscaler current node count: ${value}`}
                      color={isScalingInProgress ? 'background' : undefined}
                    >
                      {value}
                    </Text>
                  </Box>
                )}
              </OptionalValue>
            </Box>

            {additionalColumns?.map((column) => (
              <Box key={column.title} align='center'>
                {column.render(nodePool, providerNodePool)}
              </Box>
            ))}

            <Box align='center'>
              <WorkerNodesNodePoolActions
                onDeleteClick={onDelete}
                onScaleClick={onScale}
                disabled={readOnly}
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

      {nodePool && providerNodePool && (
        <Box margin={{ top: isScaleConfirmOpen ? 'small' : undefined }}>
          <WorkerNodesNodePoolItemScale
            nodePool={nodePool}
            providerNodePool={providerNodePool}
            onConfirm={onCancelScale}
            onCancel={onCancelScale}
            open={isScaleConfirmOpen}
          />
        </Box>
      )}
    </Box>
  );
};

export default WorkerNodesNodePoolItem;
