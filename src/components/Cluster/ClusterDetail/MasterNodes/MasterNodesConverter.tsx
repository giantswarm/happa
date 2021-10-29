import { Box, Heading, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

const StyledHeading = styled(Heading)`
  max-width: none;
`;

interface IMasterNodeConverterProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  onApply?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const MasterNodeConverter: React.FC<IMasterNodeConverterProps> = ({
  onApply,
  onCancel,
  isLoading,
  ...rest
}) => {
  const handleEventListener = (
    callback?: () => void
  ): ((e: React.MouseEvent<HTMLElement>) => void) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();

      callback?.();
    };
  };

  return (
    <Box {...rest}>
      <StyledHeading level={5} margin={{ top: 'none' }}>
        Do you want to convert this cluster to use three control plane nodes
        instead of one?
      </StyledHeading>
      <Text>
        This will improve the cluster&rsquo;s resilience against data center
        failures and keep the Kubernetes API available during upgrades, and will
        also increase the resource cost.
      </Text>
      <Text margin={{ top: 'small' }}>
        <strong>Note:</strong> there is no way to undo this switch.
      </Text>
      <Box direction='row' gap='small' margin={{ top: 'medium' }}>
        <Button
          primary={true}
          loading={isLoading}
          loadingTimeout={0}
          onClick={handleEventListener(onApply)}
        >
          Switch to high availability
        </Button>

        {!isLoading && (
          <Button onClick={handleEventListener(onCancel)}>Cancel</Button>
        )}
      </Box>
    </Box>
  );
};

MasterNodeConverter.defaultProps = {
  isLoading: false,
};

export default MasterNodeConverter;
