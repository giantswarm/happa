import React from 'react';
import InputGroup from 'UI/Inputs/InputGroup';
import TextInput from 'UI/Inputs/TextInput';

import { INodePoolPropertyProps } from './patches';

interface IWorkerNodesCreateNodePoolNameProps
  extends INodePoolPropertyProps,
    Omit<
      React.ComponentPropsWithoutRef<typeof InputGroup>,
      'onChange' | 'id'
    > {}

const WorkerNodesCreateNodePoolName: React.FC<
  React.PropsWithChildren<IWorkerNodesCreateNodePoolNameProps>
> = ({ id, nodePool, onChange, readOnly, disabled, ...props }) => {
  return (
    <InputGroup htmlFor={id} label='Name' {...props}>
      <TextInput
        value={nodePool.metadata.name}
        id={id}
        readOnly={readOnly}
        disabled={disabled}
      />
    </InputGroup>
  );
};

export default WorkerNodesCreateNodePoolName;
