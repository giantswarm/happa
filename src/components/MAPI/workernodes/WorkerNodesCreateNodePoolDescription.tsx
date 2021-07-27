import { hasAppropriateLength } from 'lib/helpers';
import { NodePool } from 'MAPI/types';
import { getNodePoolDescription } from 'MAPI/utils';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Constants } from 'shared/constants';
import InputGroup from 'UI/Inputs/InputGroup';
import TextInput from 'UI/Inputs/TextInput';

import { INodePoolPropertyProps, withNodePoolDescription } from './patches';

function validateValue(newValue: string, newValueLabel: string): string {
  const { message } = hasAppropriateLength(
    newValue,
    Constants.MIN_NAME_LENGTH,
    Constants.MAX_NAME_LENGTH,
    newValueLabel
  );

  return message;
}

interface IWorkerNodesCreateNodePoolDescriptionProps
  extends INodePoolPropertyProps,
    Omit<React.ComponentPropsWithoutRef<typeof InputGroup>, 'onChange' | 'id'> {
  autoFocus?: boolean;
}

const WorkerNodesCreateNodePoolDescription: React.FC<IWorkerNodesCreateNodePoolDescriptionProps> = ({
  id,
  nodePool,
  onChange,
  readOnly,
  disabled,
  autoFocus,
  ...props
}) => {
  const [validationError, setValidationError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validationResult = validateValue(e.target.value, 'Description');
    setValidationError(validationResult);

    onChange({
      isValid: validationResult.length < 1,
      patch: withNodePoolDescription(e.target.value),
    });
  };

  const value = getNodePoolDescription(nodePool);

  return (
    <InputGroup htmlFor={id} label='Description' {...props}>
      <TextInput
        value={value}
        id={id}
        error={validationError}
        onChange={handleChange}
        help='Pick a description that helps team mates to understand what these nodes are here for. You can change this later.'
        readOnly={readOnly}
        disabled={disabled}
        autoFocus={autoFocus}
      />
    </InputGroup>
  );
};

WorkerNodesCreateNodePoolDescription.propTypes = {
  id: PropTypes.string.isRequired,
  nodePool: (PropTypes.object as PropTypes.Requireable<NodePool>).isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
};

export default WorkerNodesCreateNodePoolDescription;
