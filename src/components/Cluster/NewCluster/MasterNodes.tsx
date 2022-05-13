import { Box, Text } from 'grommet';
import React from 'react';
import InputGroup from 'UI/Inputs/InputGroup';
import RadioInput from 'UI/Inputs/RadioInput';

interface IMasterNodesProps
  extends Omit<React.ComponentPropsWithoutRef<typeof InputGroup>, 'onChange'> {
  isHighAvailability?: boolean;
  onChange?: (isHA: boolean) => void;
}

const MasterNodes: React.FC<React.PropsWithChildren<IMasterNodesProps>> = ({
  isHighAvailability,
  onChange,
  ...props
}) => {
  const handleChange = (isHA: boolean) => () => {
    onChange?.(isHA);
  };

  return (
    <InputGroup
      label='Control plane nodes'
      contentProps={{
        gap: 'medium',
      }}
      margin={{
        bottom: 'small',
      }}
      {...props}
    >
      <fieldset>
        <RadioInput
          id='high-availability'
          label='High availability'
          checked={isHighAvailability}
          value='true'
          name='high-availability'
          onChange={handleChange(true)}
          formFieldProps={{ margin: { bottom: 'none' } }}
        />
        <Box as='span' pad={{ left: '29px' }}>
          <Text size='small' color='text-weak'>
            Three control plane nodes, each placed in a separate availability
            zone, selected at random. Preferred for production clusters.
          </Text>
        </Box>
      </fieldset>
      <fieldset>
        <RadioInput
          id='single-master'
          label='Single control plane node'
          checked={!isHighAvailability}
          value='false'
          name='high-availability'
          onChange={handleChange(false)}
          formFieldProps={{ margin: { bottom: 'none' } }}
        />
        <Box as='span' pad={{ left: '29px' }}>
          <Text size='small' color='text-weak'>
            One control plane node, placed in an availability zone selected at
            random.
          </Text>
        </Box>
      </fieldset>
    </InputGroup>
  );
};

MasterNodes.defaultProps = {
  isHighAvailability: false,
};

export default MasterNodes;
