import { Box, Text } from 'grommet';
import React from 'react';
import Button from 'UI/Controls/Button';

interface IWorkerNodesNodePoolListPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  onCreateButtonClick?: () => void;
  disabled?: boolean;
  unauthorized: boolean;
}

const WorkerNodesNodePoolListPlaceholder: React.FC<
  IWorkerNodesNodePoolListPlaceholderProps
> = ({ onCreateButtonClick, disabled, unauthorized, ...props }) => {
  return (
    <Box
      background='background-back'
      pad='large'
      align='center'
      gap='medium'
      {...props}
    >
      <Box>
        <Text color='text-weak'>
          {unauthorized
            ? 'For creating a node pool, you need additional permissions. Please talk to your administrator.'
            : 'Add at least one node pool to the cluster so you could run workloads'}
        </Text>
      </Box>
      <Box>
        <Button
          onClick={onCreateButtonClick}
          disabled={disabled}
          unauthorized={unauthorized}
        >
          <i
            className='fa fa-add-circle'
            role='presentation'
            aria-hidden={true}
          />{' '}
          Add node pool
        </Button>
      </Box>
    </Box>
  );
};

export default WorkerNodesNodePoolListPlaceholder;
