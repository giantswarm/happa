import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Button from 'UI/Controls/Button';
import ConfirmationPrompt from 'UI/Controls/ConfirmationPrompt';

interface IClusterDetailOverviewDeleteProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  clusterName: string;
  onDelete: () => Promise<void>;
}

const ClusterDetailOverviewDelete: React.FC<IClusterDetailOverviewDeleteProps> = ({
  clusterName,
  onDelete,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const showConfirmation = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    setConfirmationVisible(true);
  };

  const hideConfirmation = () => {
    window.setTimeout(() => {
      setConfirmationVisible(false);
    });
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setConfirmationVisible(false);

    try {
      await onDelete();
    } catch (err: unknown) {
      const message = (err as Error).message;

      setIsLoading(false);

      new FlashMessage(
        `Could not delete cluster ${clusterName}:`,
        messageType.ERROR,
        messageTTL.LONG,
        message
      );

      ErrorReporter.getInstance().notify(err as never);
    }
  };

  return (
    <Box direction='column' gap='medium' pad={{ top: 'medium' }} {...props}>
      <Text weight='bold' size='large' margin='none'>
        Delete this cluster
      </Text>
      <Box width='large'>
        <Text>
          All workloads on this cluster will be terminated. Data stored on the
          worker nodes will be lost. There is no way to undo this action.
        </Text>
      </Box>
      <Box>
        <ConfirmationPrompt
          open={confirmationVisible}
          onConfirm={handleDelete}
          onCancel={hideConfirmation}
          confirmButton={
            <Button bsStyle='danger' onClick={handleDelete}>
              <i
                className='fa fa-delete'
                role='presentation'
                aria-hidden={true}
                aria-label='Delete'
              />{' '}
              Delete {clusterName}
            </Button>
          }
          title={`Do you really want to delete cluster ${clusterName}?`}
        >
          <Text>
            As you might have read in the text above, this means that there is
            no way back.
          </Text>
        </ConfirmationPrompt>

        {!confirmationVisible && (
          <Box animation={{ type: 'fadeIn', duration: 300 }}>
            <Button
              bsStyle='danger'
              onClick={showConfirmation}
              loading={isLoading}
            >
              <i
                className='fa fa-delete'
                role='presentation'
                aria-hidden={true}
                aria-label='Delete'
              />{' '}
              Delete cluster
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

ClusterDetailOverviewDelete.propTypes = {
  clusterName: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ClusterDetailOverviewDelete;
