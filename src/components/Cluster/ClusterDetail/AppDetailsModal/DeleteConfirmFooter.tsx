import { Box } from 'grommet';
import React from 'react';
import Button from 'UI/Controls/Button';

interface IDeleteConfirmFooterProps {
  cta?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const DeleteConfirmFooter: React.FC<IDeleteConfirmFooterProps> = ({
  cta,
  onConfirm,
  onCancel,
}) => {
  return (
    <Box direction='row' gap='small' justify='end'>
      <Button
        danger={true}
        onClick={onConfirm}
        icon={
          <i
            className='fa fa-delete'
            role='presentation'
            aria-hidden='true'
            aria-label={cta}
          />
        }
      >
        {cta}
      </Button>
      <Button link={true} onClick={onCancel}>
        Cancel
      </Button>
    </Box>
  );
};

export default DeleteConfirmFooter;
