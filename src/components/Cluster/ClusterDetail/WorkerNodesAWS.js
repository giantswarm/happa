import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { FallbackMessages } from 'shared/constants';
import { Code, FallbackSpan } from 'styles';
import theme from 'styles/theme';
import AvailabilityZonesLabels from 'UI/AvailabilityZonesLabels';
import Button from 'UI/Button';
import RefreshableLabel from 'UI/RefreshableLabel';
import { isClusterYoungerThanOneHour } from 'utils/clusterUtils';

import { LineDiv, ScalingNodeCounter, WrapperDiv } from './WorkerNodesAzure';

function WorkerNodesAWS({
  az,
  createDate,
  instanceName,
  instanceType,
  scaling,
  showScalingModal,
  workerNodesDesired,
  workerNodesRunning,
}) {
  const instanceTypeText = instanceType
    ? // prettier-ignore
      `${instanceType.cpu_cores} CPUs, ${instanceType.memory_size_gb.toFixed(0)} GB RAM`
    : '0 CPUs, 0 GB RAM';

  const scalingText =
    scaling && scaling.min === scaling.max
      ? `Pinned at ${scaling.min}`
      : `Autoscaling between ${scaling.min} and ${scaling.max}`;

  return (
    <WrapperDiv>
      <LineDiv>
        <div>Availability zones</div>
        <div>
          <AvailabilityZonesLabels zones={az} />
        </div>
      </LineDiv>
      <LineDiv>
        <div>Instance type</div>
        <Code style={{ background: theme.colors.shade7, marginRight: '10px' }}>
          {instanceName && instanceName}
        </Code>
        <RefreshableLabel value={instanceTypeText}>
          {instanceTypeText}
        </RefreshableLabel>
      </LineDiv>
      <LineDiv>
        <div>Scaling</div>
        <ScalingNodeCounter value={scalingText}>
          {scalingText}
        </ScalingNodeCounter>
        <Button onClick={showScalingModal}>Edit</Button>
      </LineDiv>
      <LineDiv data-testid='desired-nodes'>
        <OverlayTrigger
          overlay={
            <Tooltip id='desired-tooltip'>
              Autoscaler&apos;s idea how many nodes would be required for the
              workloads
            </Tooltip>
          }
          placement='top'
        >
          <div>
            Desired number <i className='fa fa-info' />
          </div>
        </OverlayTrigger>
        <RefreshableLabel value={workerNodesDesired}>
          {workerNodesDesired === 0 &&
          isClusterYoungerThanOneHour(createDate) ? (
            <FallbackSpan>{FallbackMessages.NODES_NOT_READY}</FallbackSpan>
          ) : (
            workerNodesDesired
          )}
        </RefreshableLabel>
      </LineDiv>
      <LineDiv data-testid='running-nodes'>
        <div>Current number</div>
        <RefreshableLabel value={workerNodesRunning}>
          {workerNodesRunning === 0 &&
          isClusterYoungerThanOneHour(createDate) ? (
            <FallbackSpan>{FallbackMessages.NODES_NOT_READY}</FallbackSpan>
          ) : (
            workerNodesRunning
          )}
        </RefreshableLabel>
      </LineDiv>
    </WrapperDiv>
  );
}

WorkerNodesAWS.propTypes = {
  az: PropTypes.array,
  instanceName: PropTypes.string,
  instanceType: PropTypes.object,
  createDate: PropTypes.string,
  scaling: PropTypes.object,
  showScalingModal: PropTypes.func,
  workerNodesDesired: PropTypes.number,
  workerNodesRunning: PropTypes.number,
};

export default WorkerNodesAWS;
