import { NodePool } from 'MAPI/types';
import { getNodePoolScaling } from 'MAPI/utils';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import NodeCountSelector from 'shared/NodeCountSelector';
import InputGroup from 'UI/Inputs/InputGroup';

import { INodePoolPropertyProps, withNodePoolScaling } from './patches';

interface IWorkerNodesCreateNodePoolScaleProps
  extends INodePoolPropertyProps,
    Omit<
      React.ComponentPropsWithoutRef<typeof InputGroup>,
      'onChange' | 'id'
    > {}

const WorkerNodesCreateNodePoolScale: React.FC<IWorkerNodesCreateNodePoolScaleProps> = ({
  id,
  nodePool,
  onChange,
  readOnly,
  disabled,
  ...props
}) => {
  const isMinValid = useRef(false);
  const isMaxValid = useRef(false);

  const handleChange = (newValue: {
    scaling: {
      min: number;
      minValid: boolean;
      max: number;
      maxValid: boolean;
    };
  }) => {
    const { min, minValid, max, maxValid } = newValue.scaling;

    isMinValid.current = minValid;
    isMaxValid.current = maxValid;

    onChange({
      isValid: minValid && maxValid,
      patch: withNodePoolScaling(min, max),
    });
  };

  const value = getNodePoolScaling(nodePool);

  return (
    <InputGroup htmlFor={id} label='Scaling range' {...props}>
      <NodeCountSelector
        id={id}
        autoscalingEnabled={true}
        onChange={handleChange}
        readOnly={readOnly || disabled}
        scaling={{
          min: value.min,
          minValid: isMinValid.current,
          max: value.max,
          maxValid: isMaxValid.current,
        }}
      />
    </InputGroup>
  );
};

WorkerNodesCreateNodePoolScale.propTypes = {
  id: PropTypes.string.isRequired,
  nodePool: (PropTypes.object as PropTypes.Requireable<NodePool>).isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default WorkerNodesCreateNodePoolScale;
