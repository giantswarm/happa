import { getNodePoolDescription } from 'MAPI/utils';
import { Constants } from 'model/constants';
import React, { useEffect, useRef, useState } from 'react';
import InputGroup from 'UI/Inputs/InputGroup';
import TextInput from 'UI/Inputs/TextInput';
import { hasAppropriateLength } from 'utils/helpers';

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

const WorkerNodesCreateNodePoolDescription: React.FC<IWorkerNodesCreateNodePoolDescriptionProps> =
  ({
    id,
    nodePool,
    providerNodePool,
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

    const value = getNodePoolDescription(nodePool, providerNodePool, '');

    const textInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (!textInputRef.current || !autoFocus) return;

      setTimeout(() => {
        textInputRef.current?.select();
      });

      // Only run for the initial render.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
          ref={textInputRef}
        />
      </InputGroup>
    );
  };

export default WorkerNodesCreateNodePoolDescription;
