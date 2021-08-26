import { Box, Keyboard, Text } from 'grommet';
import React from 'react';
import TextInput from 'UI/Inputs/TextInput';

import { ClusterDetailDeleteActionNameVariant } from './ClusterDetailDeleteAction';

interface IClusterDetailDeleteActionClusterNameProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Box>, 'onChange'> {
  variant: ClusterDetailDeleteActionNameVariant;
  value: string;
  onChange: (newValue: string) => void;
  onContinue: () => void;
}

const ClusterDetailDeleteActionClusterName: React.FC<IClusterDetailDeleteActionClusterNameProps> = ({
  variant,
  value,
  onChange,
  onContinue,
  ...props
}) => {
  const handleFormSubmit = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();

    onContinue();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Box direction='row' gap='small' align='baseline' {...props}>
      <Text>If yes, please enter the cluster {variant}:</Text>
      <Keyboard onEnter={handleFormSubmit}>
        <TextInput
          width='xxsmall'
          autoFocus={true}
          onChange={handleChange}
          value={value}
          autoComplete='false'
          autoCorrect='false'
          autoCapitalize='false'
          aria-label={`Cluster ${variant}`}
        />
      </Keyboard>
    </Box>
  );
};

export default ClusterDetailDeleteActionClusterName;
