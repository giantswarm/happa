import { Box } from 'grommet';
import React, { useState } from 'react';
import Button from 'UI/Controls/Button';

interface ICreateClusterAppFormProps {
  namespace: string;
  organizationID: string;
  onCreationCancel?: () => void;
  onCreationComplete?: (clusterId: string) => void;
}

const CreateClusterAppForm: React.FC<ICreateClusterAppFormProps> = ({
  onCreationCancel,
  onCreationComplete,
}) => {
  const [isCreating, _] = useState<boolean>(false);

  const handleCreation = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    if (onCreationComplete) onCreationComplete('');
  };

  return (
    <Box
      as='form'
      onSubmit={handleCreation}
      width={{ max: '100%', width: 'large' }}
      gap='medium'
      margin='auto'
    >
      <Box margin={{ top: 'medium' }}>
        <Box direction='row' gap='small'>
          <Button primary={true} type='submit' loading={isCreating}>
            Create cluster
          </Button>

          {!isCreating && <Button onClick={onCreationCancel}>Cancel</Button>}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateClusterAppForm;
