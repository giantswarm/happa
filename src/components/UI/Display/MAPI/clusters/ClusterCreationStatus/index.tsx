import { Box, Image, Text } from 'grommet';
import { spinner } from 'images';
import React from 'react';
import styled from 'styled-components';

const Icon = styled(Text)`
  line-height: 20px;
`;

export enum ClusterCreationStatus {
  Waiting = 'WAITING',
  Ok = 'OK',
  Failed = 'FAILED',
  InProgress = 'IN_PROGRESS',
}

function formatStatus(
  status: ClusterCreationStatus,
  totalCount?: number,
  readyCount?: number
) {
  switch (status) {
    case ClusterCreationStatus.Waiting:
      return 'Waiting';
    case ClusterCreationStatus.Ok:
      return 'OK';
    case ClusterCreationStatus.Failed:
      return 'Failed';
    case ClusterCreationStatus.InProgress:
      return typeof totalCount !== 'undefined' &&
        typeof readyCount !== 'undefined'
        ? `${readyCount} of ${totalCount}`
        : 'In progress';
    default:
      return '';
  }
}

interface IClusterCreationStatusProps {
  status: ClusterCreationStatus;
  totalCount?: number;
  readyCount?: number;
}

const ClusterCreationStatusComponent: React.FC<IClusterCreationStatusProps> = ({
  status,
  totalCount,
  readyCount,
}) => {
  let statusEl = <Text>{formatStatus(status)}</Text>;

  if (status === ClusterCreationStatus.Ok) {
    statusEl = (
      <Box direction='row'>
        <Icon
          color='text-success'
          className='fa fa-done'
          role='presentation'
          aria-hidden='true'
          size='28px'
          margin={{ right: '4px' }}
        />
        <Text color='text-success'>{formatStatus(status)}</Text>
      </Box>
    );
  }

  if (status === ClusterCreationStatus.Failed) {
    statusEl = (
      <Box direction='row'>
        <Icon
          color='text-error'
          className='fa fa-close'
          role='presentation'
          aria-hidden='true'
          size='30px'
          margin={{ right: '4px' }}
        />
        <Text color='text-error'>{formatStatus(status)}</Text>
      </Box>
    );
  }

  if (status === ClusterCreationStatus.InProgress) {
    statusEl = (
      <Box direction='row'>
        <Box height='20px' width='20px' margin={{ left: '5px', right: '9px' }}>
          <Image src={spinner} className='loader' />
        </Box>
        <Text>{formatStatus(status, totalCount, readyCount)}</Text>
      </Box>
    );
  }

  return <Box width={{ min: '110px' }}>{statusEl}</Box>;
};

export default ClusterCreationStatusComponent;
