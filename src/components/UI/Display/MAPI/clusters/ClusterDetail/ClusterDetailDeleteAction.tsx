import { Box, Text } from 'grommet';
import React, { useState } from 'react';
import Button from 'UI/Controls/Button';
import ConfirmationPrompt from 'UI/Controls/ConfirmationPrompt';
import useDebounce from 'utils/hooks/useDebounce';

import ClusterDetailDeleteActionClusterDetails from './ClusterDetailDeleteActionClusterDetails';
import ClusterDetailDeleteActionClusterName from './ClusterDetailDeleteActionClusterName';

const NAME_CONFIRMATION_UPDATE_RATE = 250; // In ms.

enum ConfirmationStep {
  ClusterDetails,
  ClusterName,
}

function getConfirmationPromptTitle(step: ConfirmationStep) {
  switch (step) {
    case ConfirmationStep.ClusterDetails:
      return 'Is this the cluster you want to delete?';
    case ConfirmationStep.ClusterName:
      return 'Are you sure you want to delete this cluster forever?';
    default:
      return '';
  }
}

export enum ClusterDetailDeleteActionNameVariant {
  ID = 'ID',
  Name = 'name',
}

interface IClusterDetailDeleteActionProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  name: string;
  description: string;
  creationDate: string;
  workerNodesCount: number;
  nodePoolsCount: number;
  userInstalledAppsCount?: number;
  onDelete: () => void;
  isLoading?: boolean;
  variant?: ClusterDetailDeleteActionNameVariant;
  disabled?: boolean;
  unauthorized?: boolean;
}

const ClusterDetailDeleteAction: React.FC<IClusterDetailDeleteActionProps> = ({
  name,
  description,
  creationDate,
  workerNodesCount,
  nodePoolsCount,
  userInstalledAppsCount,
  onDelete,
  isLoading,
  variant,
  disabled,
  unauthorized,
  ...props
}) => {
  const [confirmationStep, setConfirmationStep] = useState(
    ConfirmationStep.ClusterDetails
  );

  const [nameConfirmation, setNameConfirmation] = useState('');

  const isNameConfirmed = nameConfirmation === name;
  const debouncedIsNameConfirmed = useDebounce(
    isNameConfirmed,
    NAME_CONFIRMATION_UPDATE_RATE
  );

  let isConfirmButtonDisabled =
    confirmationStep === ConfirmationStep.ClusterName;
  if (isConfirmButtonDisabled && debouncedIsNameConfirmed) {
    isConfirmButtonDisabled = false;
  }

  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const showConfirmation = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    setConfirmationVisible(true);
  };

  const hideConfirmation = () => {
    setTimeout(() => {
      setConfirmationVisible(false);
    });

    setTimeout(() => {
      setConfirmationStep(ConfirmationStep.ClusterDetails);
      setNameConfirmation('');
      // eslint-disable-next-line no-magic-numbers
    }, 200);
  };

  const handleContinue = () => {
    if (confirmationStep !== ConfirmationStep.ClusterName) {
      setConfirmationStep(confirmationStep + 1);

      return;
    }

    onDelete();
    hideConfirmation();
  };

  return (
    <Box direction='column' gap='medium' pad={{ top: 'medium' }} {...props}>
      <Box width={{ max: 'large' }}>
        {unauthorized ? (
          <Text>
            For deleting this cluster, you need additional permissions. Please
            talk to your administrator.
          </Text>
        ) : (
          <Text>
            Please make sure you really want to delete this cluster before you
            proceed, as there is no way to undo this. Data stored on the worker
            nodes will be lost. Workloads will be terminated.
          </Text>
        )}
      </Box>
      <Box>
        <ConfirmationPrompt
          open={confirmationVisible}
          onConfirm={onDelete}
          onCancel={hideConfirmation}
          confirmButton={
            <Button
              danger={true}
              onClick={handleContinue}
              disabled={isConfirmButtonDisabled}
            >
              {confirmationStep === ConfirmationStep.ClusterDetails &&
                'Confirm…'}
              {confirmationStep === ConfirmationStep.ClusterName && (
                <>
                  <i
                    className='fa fa-delete'
                    role='presentation'
                    aria-hidden={true}
                    aria-label='Delete'
                  />{' '}
                  Delete
                </>
              )}
            </Button>
          }
          title={getConfirmationPromptTitle(confirmationStep)}
        >
          {confirmationStep === ConfirmationStep.ClusterDetails && (
            <ClusterDetailDeleteActionClusterDetails
              variant={variant!}
              name={name}
              description={description}
              creationDate={creationDate}
              workerNodesCount={workerNodesCount}
              nodePoolsCount={nodePoolsCount}
              userInstalledAppsCount={userInstalledAppsCount}
            />
          )}

          {confirmationStep === ConfirmationStep.ClusterName && (
            <ClusterDetailDeleteActionClusterName
              variant={variant!}
              value={nameConfirmation}
              onChange={setNameConfirmation}
              onContinue={handleContinue}
            />
          )}
        </ConfirmationPrompt>

        {!confirmationVisible && (
          <Box animation={{ type: 'fadeIn', duration: 300 }}>
            <Button
              onClick={showConfirmation}
              loading={isLoading}
              disabled={disabled}
              unauthorized={unauthorized}
            >
              <i
                className='fa fa-delete'
                role='presentation'
                aria-hidden={true}
                aria-label='Delete'
              />{' '}
              Delete…
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

ClusterDetailDeleteAction.defaultProps = {
  variant: ClusterDetailDeleteActionNameVariant.Name,
};

export default ClusterDetailDeleteAction;
