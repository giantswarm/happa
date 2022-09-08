import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { NodePool, ProviderNodePool } from 'MAPI/types';
import {
  extractErrorMessage,
  getNodePoolAvailabilityZones,
  getNodePoolDescription,
  getNodePoolScaling,
} from 'MAPI/utils';
import { Providers } from 'model/constants';
import React, { useMemo, useRef, useState } from 'react';
import Copyable from 'shared/Copyable';
import styled from 'styled-components';
import { Code } from 'styles';
import { AvailabilityZonesLabelVariant } from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabel';
import AvailabilityZonesLabels from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabels';
import Date from 'UI/Display/Date';
import { NodePoolGridRow } from 'UI/Display/MAPI/workernodes/styles';
import WorkerNodesNodePoolActions from 'UI/Display/MAPI/workernodes/WorkerNodesNodePoolActions';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
import ViewAndEditName, {
  ViewAndEditNameVariant,
} from 'UI/Inputs/ViewEditName';
import Truncated from 'UI/Util/Truncated';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { getTruncationParams } from 'utils/helpers';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { IWorkerNodesAdditionalColumn } from './types';
import {
  deleteNodePoolResources,
  getCGroupsVersion,
  updateNodePoolDescription,
} from './utils';
import WorkerNodesNodePoolItemDelete from './WorkerNodesNodePoolItemDelete';
import WorkerNodesNodePoolItemMachineType from './WorkerNodesNodePoolItemMachineType';
import WorkerNodesNodePoolItemScale from './WorkerNodesNodePoolItemScale';

function formatAvailabilityZonesLabel(
  zones: string[],
  provider: PropertiesOf<typeof Providers>
) {
  const availabilityZonesLabel =
    provider === Providers.GCP ? 'Zones' : 'Availability zones';

  if (zones.length < 1) {
    return `${availabilityZonesLabel}: not available`;
  }

  return `${availabilityZonesLabel}: ${zones.join(', ')}`;
}

const Row = styled(Box)<{
  additionalColumnsCount?: number;
  nameColumnWidth?: number;
  displayMenuColumn?: boolean;
}>`
  ${({ additionalColumnsCount, nameColumnWidth, displayMenuColumn }) =>
    NodePoolGridRow(additionalColumnsCount, nameColumnWidth, displayMenuColumn)}
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

export const MAX_NAME_LENGTH = 10;

interface IWorkerNodesNodePoolItemProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  nodePool?: NodePool;
  providerNodePool?: ProviderNodePool | null;
  additionalColumns?: IWorkerNodesAdditionalColumn[];
  readOnly?: boolean;
  canUpdateNodePools?: boolean;
  canDeleteNodePools?: boolean;
  nameColumnWidth?: number;
  displayCGroupsVersion?: boolean;
  flatcarContainerLinuxVersion?: string;
  hideNodePoolAutoscaling?: boolean;
}

const WorkerNodesNodePoolItem: React.FC<
  React.PropsWithChildren<IWorkerNodesNodePoolItemProps>
> = ({
  nodePool,
  providerNodePool,
  additionalColumns,
  readOnly,
  canUpdateNodePools,
  canDeleteNodePools,
  nameColumnWidth,
  displayCGroupsVersion = true,
  flatcarContainerLinuxVersion,
  hideNodePoolAutoscaling = false,
  ...props
}) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const description = useMemo(() => {
    if (!nodePool || typeof providerNodePool === 'undefined') return undefined;

    return getNodePoolDescription(nodePool, providerNodePool, '');
  }, [nodePool, providerNodePool]);
  const availabilityZones =
    nodePool && providerNodePool
      ? getNodePoolAvailabilityZones(nodePool, providerNodePool)
      : undefined;
  const cgroupsVersion = useMemo(() => {
    if (!nodePool) return undefined;
    if (!flatcarContainerLinuxVersion) return '';

    return getCGroupsVersion(nodePool, flatcarContainerLinuxVersion);
  }, [nodePool, flatcarContainerLinuxVersion]);

  const scaling = useMemo(() => {
    if (!nodePool || typeof providerNodePool === 'undefined') return undefined;

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

  const provider = window.config.info.general.provider;

  return (
    <Box {...props}>
      <Row
        background={isDeleting ? 'background-back' : 'background-front'}
        round='xsmall'
        additionalColumnsCount={
          (additionalColumns?.length ?? 0) +
          Number(displayCGroupsVersion) +
          (hideNodePoolAutoscaling ? 0 : 2)
        }
        nameColumnWidth={nameColumnWidth}
        displayMenuColumn={!readOnly}
      >
        <Box align='flex-start'>
          <OptionalValue
            value={nodePool?.metadata.name}
            loaderWidth={70}
            loaderHeight={26}
          >
            {(value) => (
              <Copyable copyText={value}>
                <Truncated
                  as={Code}
                  aria-label={`Name: ${value}`}
                  {...getTruncationParams(MAX_NAME_LENGTH)}
                >
                  {value}
                </Truncated>
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
                    Deleted{' '}
                    <Date
                      relative={true}
                      value={nodePool.metadata.deletionTimestamp}
                    />
                  </Text>
                </Box>
              ) : (
                <StyledViewAndEditName
                  value={value}
                  typeLabel='node pool'
                  onToggleEditingState={setIsEditingDescription}
                  aria-label={`Description: ${value}`}
                  onSave={updateDescription}
                  ref={viewAndEditNameRef}
                  variant={ViewAndEditNameVariant.Description}
                  readOnly={readOnly}
                  unauthorized={!canUpdateNodePools}
                />
              )
            }
          </OptionalValue>
        </StyledDescriptionWrapper>
        {!isDeleting && !isEditingDescription && (
          <>
            <WorkerNodesNodePoolItemMachineType
              nodePool={nodePool}
              providerNodePool={providerNodePool ?? undefined}
            />
            <Box align='center'>
              <OptionalValue value={availabilityZones} loaderHeight={26}>
                {(value) => (
                  <Box
                    direction='row'
                    aria-label={formatAvailabilityZonesLabel(value, provider)}
                  >
                    <AvailabilityZonesLabels
                      zones={value}
                      labelsChecked={[]}
                      variant={
                        provider === Providers.GCP
                          ? AvailabilityZonesLabelVariant.Zone
                          : AvailabilityZonesLabelVariant.AvailabilityZone
                      }
                    />
                  </Box>
                )}
              </OptionalValue>
            </Box>
            {displayCGroupsVersion && (
              <Box align='center'>
                <OptionalValue value={cgroupsVersion} loaderWidth={30}>
                  {(value) => (
                    <Box pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}>
                      <Text aria-label={`Control groups version: ${value}`}>
                        {value}
                        {value === 'v1' && (
                          <>
                            {' '}
                            <TooltipContainer
                              content={
                                <Tooltip>
                                  This node pool uses the deprecated control
                                  groups version 1.
                                </Tooltip>
                              }
                            >
                              <i
                                className='fa fa-warning'
                                aria-label='Warning: This node pool uses the deprecated control groups version 1.'
                              />
                            </TooltipContainer>
                          </>
                        )}
                      </Text>
                    </Box>
                  )}
                </OptionalValue>
              </Box>
            )}
            {!hideNodePoolAutoscaling && (
              <>
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
              </>
            )}
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
                {column.render(nodePool, providerNodePool ?? undefined)}
              </Box>
            ))}

            {!readOnly && (
              <Box align='center'>
                <WorkerNodesNodePoolActions
                  onDeleteClick={onDelete}
                  onScaleClick={onScale}
                  disabled={readOnly}
                  canUpdateNodePools={canUpdateNodePools}
                  canDeleteNodePools={canDeleteNodePools}
                />
              </Box>
            )}
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
