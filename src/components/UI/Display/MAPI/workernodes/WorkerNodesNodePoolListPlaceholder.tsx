import { Box, Text } from 'grommet';
import React from 'react';
import Button from 'UI/Controls/Button';

interface IWorkerNodesNodePoolListPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  onCreateButtonClick?: () => void;
  readOnly?: boolean;
  canCreateNodePools?: boolean;
}

const WorkerNodesNodePoolListPlaceholder: React.FC<
  React.PropsWithChildren<IWorkerNodesNodePoolListPlaceholderProps>
> = ({ onCreateButtonClick, readOnly, canCreateNodePools, ...props }) => {
  return (
    <Box background='background-back' pad='large' {...props}>
      {readOnly ? (
        <Text color='text-weak'>No node pools.</Text>
      ) : (
        <Box align='center' gap='medium'>
          <Box>
            <Text color='text-weak'>
              {canCreateNodePools
                ? 'Add at least one node pool to the cluster so you could run workloads'
                : 'For creating a node pool, you need additional permissions. Please talk to your administrator.'}
            </Text>
          </Box>
          <Box>
            <Button
              onClick={onCreateButtonClick}
              unauthorized={!canCreateNodePools}
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
      )}
    </Box>
  );
};

export default WorkerNodesNodePoolListPlaceholder;
