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
      min={2}
      onChange={onUpdateCPUCores}
      value={cpuCores}
    />
    <KVMNumberPicker
      label='Memory (GB)'
      min={3}
      onChange={onUpdateMemorySize}
      value={memorySize}
    />
    <KVMNumberPicker
      label='Storage (GB)'
      min={10}
      onChange={onUpdateDiskSize}
      step={10}
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
