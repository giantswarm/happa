import { Box } from 'grommet';
import React, { FC } from 'react';
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

const KVMWorkerConfiguration: FC<
  React.PropsWithChildren<IKVMWorkerConfiguration>
> = ({
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
    <Box direction='column' gap='xsmall' margin={{ top: 'small' }}>
      <NumberPicker
        id='cpu-cores'
        label='CPU Cores'
        min={2}
        max={999}
        onChange={onUpdateCPUCores}
        value={cpuCores}
        contentProps={{
          width: 'small',
        }}
      />
      <NumberPicker
        id='memory'
        label='Memory (GB)'
        min={3}
        max={999}
        onChange={onUpdateMemorySize}
        value={memorySize}
        contentProps={{
          width: 'small',
        }}
      />
      <NumberPicker
        id='storage'
        label='Storage (GB)'
        min={10}
        max={999}
        onChange={onUpdateDiskSize}
        step={10}
        value={diskSize}
        contentProps={{
          width: 'small',
        }}
      />
    </Box>
  </>
);

export default KVMWorkerConfiguration;
