import { Box } from 'grommet';
import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'UI/Controls/Button';

const UsersModal = ({
  show,
  onClose,
  onConfirm,
  isLoading,
  children,
  title,
  confirmText,
  confirmDisabled,
  confirmHidden,
  cancelText,
  ...props
}) => {
  return (
    <BootstrapModal
      className='create-key-pair-modal'
      onHide={onClose}
      show={show}
      {...props}
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>{children}</BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Box gap='small' direction='row' justify='end'>
          {!confirmHidden && (
            <Button
              danger={true}
              loading={isLoading}
              onClick={onConfirm}
              type='submit'
              disabled={confirmDisabled}
            >
              {confirmText}
            </Button>
          )}

          {!isLoading && (
            <Button link={true} onClick={onClose}>
              {cancelText}
            </Button>
          )}
        </Box>
      </BootstrapModal.Footer>
    </BootstrapModal>
  );
};

UsersModal.defaultProps = {
  show: false,
  title: '',
  // eslint-disable-next-line no-empty-function
  onClose: () => {},
  // eslint-disable-next-line no-empty-function
  onConfirm: () => {},
  isLoading: false,
  confirmText: 'Confirm',
  confirmDisabled: false,
  confirmHidden: false,
  cancelText: 'Cancel',
};

export default UsersModal;
