import { Text } from 'grommet';
import React from 'react';
import Button from 'UI/Controls/Button';
import ConfirmationPrompt from 'UI/Controls/ConfirmationPrompt';

interface IWorkerNodesNodePoolItemDeleteProps
  extends React.ComponentPropsWithoutRef<typeof ConfirmationPrompt> {
  nodePoolName: string;
  isLoading?: boolean;
}

const WorkerNodesNodePoolItemDelete: React.FC<IWorkerNodesNodePoolItemDeleteProps> =
  ({ nodePoolName, onConfirm, isLoading, onCancel, ...props }) => {
    return (
      <ConfirmationPrompt
        onConfirm={onConfirm}
        confirmButton={
          <Button danger={true} onClick={onConfirm} loading={isLoading}>
            <i
              className='fa fa-delete'
              role='presentation'
              aria-hidden={true}
              aria-label='Delete'
            />{' '}
            Delete {nodePoolName}
          </Button>
        }
        onCancel={!isLoading ? onCancel : undefined}
        title={`Do you really want to delete node pool ${nodePoolName}?`}
        {...props}
      >
        <Text>
          Nodes will be drained and workloads re-scheduled, if possible, to
          nodes from other pools.
        </Text>
        <Text>
          <Text weight='bold'>Note</Text>: Make sure your scheduling rules are
          tolerant enough so that workloads can be re-assigned.
        </Text>
      </ConfirmationPrompt>
    );
  };

export default WorkerNodesNodePoolItemDelete;
