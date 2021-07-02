import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
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
        <Button bsStyle='default' onClick={onCreateButtonClick}>
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

WorkerNodesNodePoolListPlaceholder.propTypes = {
  onCreateButtonClick: PropTypes.func,
};

export default WorkerNodesNodePoolListPlaceholder;
