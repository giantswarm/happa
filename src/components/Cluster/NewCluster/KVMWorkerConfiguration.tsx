import PropTypes from 'prop-types';
import React, { FC } from 'react';
import styled from 'styled-components';
import { AdditionalInputHint } from 'UI/Display/Cluster/ClusterCreation/StyledInput';
import NumberPicker from 'UI/Inputs/NumberPicker';

interface INumberPickerOnChangePayload {
  valid: boolean;
  value: number;
}

interface IKVMWorkerConfiguration {
  cpuCores: number;
  diskSize: number;
  memorySize: number;
  onUpdateCPUCores(args: INumberPickerOnChangePayload): void;
  onUpdateDiskSize(args: INumberPickerOnChangePayload): void;
  onUpdateMemorySize(args: INumberPickerOnChangePayload): void;
}

const KVMNumberPicker = styled(NumberPicker)`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacingPx * 6}px;
`;

const KVMWorkerConfiguration: FC<IKVMWorkerConfiguration> = ({
  cpuCores,
  diskSize,
  memorySize,
  onUpdateCPUCores,
  onUpdateDiskSize,
  onUpdateMemorySize,
}) => (
  <>
    <AdditionalInputHint>
      Configure the amount of CPU, RAM and Storage for your workers. The storage
      size specified will apply to both the kubelet and the Docker volume of the
      node, so please make sure to have twice the specified size available as
      disk space.
    </AdditionalInputHint>
    <KVMNumberPicker
      label='CPU Cores'
      max={999}
      min={2}
      onChange={onUpdateCPUCores}
      stepSize={1}
      value={cpuCores}
    />
    <KVMNumberPicker
      label='Memory (GB)'
      max={999}
      min={3}
      onChange={onUpdateMemorySize}
      stepSize={1}
      value={memorySize}
    />
    <KVMNumberPicker
      label='Storage (GB)'
      max={999}
      min={10}
      onChange={onUpdateDiskSize}
      stepSize={10}
      value={diskSize}
    />
  </>
);

KVMWorkerConfiguration.propTypes = {
  cpuCores: PropTypes.number.isRequired,
  diskSize: PropTypes.number.isRequired,
  memorySize: PropTypes.number.isRequired,
  onUpdateCPUCores: PropTypes.func.isRequired,
  onUpdateDiskSize: PropTypes.func.isRequired,
  onUpdateMemorySize: PropTypes.func.isRequired,
};

export default KVMWorkerConfiguration;
