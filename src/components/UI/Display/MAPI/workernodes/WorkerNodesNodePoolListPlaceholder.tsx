import { Box, Text } from 'grommet';
import React from 'react';
import Button from 'UI/Controls/Button';

interface IWorkerNodesNodePoolListPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  onCreateButtonClick?: () => void;
}

const WorkerNodesNodePoolListPlaceholder: React.FC<IWorkerNodesNodePoolListPlaceholderProps> = ({
  onCreateButtonClick,
  ...props
}) => {
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
          Add at least one node pool to the cluster so you could run workloads
        </Text>
      </Box>
      <Box>
        <Button onClick={onCreateButtonClick}>
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
